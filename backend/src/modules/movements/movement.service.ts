import mongoose from 'mongoose';
import { Movement, MovementType } from './movement.model';
import { Stock } from './stock.model';
import { Product } from '../products/product.model';
import { Warehouse } from '../warehouses/warehouse.model';
import { assertOwnership } from '../../utils/ownershipCheck';

export class MovementService {
  static async list(orgId: string, query: any) {
    const { page = 1, limit = 20, productId, warehouseId, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = { orgId };
    if (productId) filter.productId = productId;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const movements = await Movement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Movement.countDocuments(filter);

    return {
      movements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async create(orgId: string, userId: string, data: any) {
    const { productId, warehouseId, type, quantity, reference, notes } = data;

    // 1. Verify ownership
    await assertOwnership(Product, productId, orgId);
    await assertOwnership(Warehouse, warehouseId, orgId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2. Get current stock
      const stock = await Stock.findOneAndUpdate(
        { orgId, productId, warehouseId },
        { $setOnInsert: { quantity: 0 } },
        { upsert: true, new: true, session }
      );

      const quantityBefore = stock.quantity;
      let quantityAfter = quantityBefore;

      const addTypes: MovementType[] = ['receive', 'transfer_in', 'return'];
      const subTypes: MovementType[] = ['sell', 'transfer_out', 'write_off'];

      if (addTypes.includes(type)) {
        quantityAfter += quantity;
      } else if (subTypes.includes(type)) {
        quantityAfter -= quantity;
      } else if (type === 'adjust') {
        quantityAfter += quantity; // quantity can be negative for adjust
      }

      if (quantityAfter < 0) {
        // Assume org.allowNegativeStock is false by default
        const err = new Error('Insufficient stock') as any;
        err.statusCode = 400;
        err.code = 'INVALID_REQUEST';
        throw err;
      }

      // 3. Update Stock
      stock.quantity = quantityAfter;
      await stock.save({ session });

      // 4. Create Movement
      const movement = new Movement({
        orgId,
        productId,
        warehouseId,
        type,
        quantity,
        quantityBefore,
        quantityAfter,
        reference,
        notes,
        performedBy: userId,
      });
      await movement.save({ session });

      await session.commitTransaction();

      // Emit socket event for real-time updates
      try {
        const { getIO } = require('../../sockets');
        getIO().to(orgId).emit('stock_update', {
          productId,
          warehouseId,
          type,
          quantityAfter,
          movementId: movement._id
        });
      } catch (err) {
        console.error('Socket emission failed:', err);
      }

      return movement;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
