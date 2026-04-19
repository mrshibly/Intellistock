import { PurchaseOrder } from './purchaseOrder.model';
import { assertOwnership } from '../../utils/ownershipCheck';
import { MovementService } from '../movements/movement.service';

export class PurchaseOrderService {
  static async list(orgId: string) {
    return PurchaseOrder.find({ orgId }).sort({ createdAt: -1 });
  }

  static async getById(orgId: string, id: string) {
    return assertOwnership(PurchaseOrder, id, orgId);
  }

  static async create(orgId: string, userId: string, data: any) {
    const poCount = await PurchaseOrder.countDocuments({ orgId });
    const poNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(poCount + 1).toString().padStart(4, '0')}`;
    
    const totalAmount = data.lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unitCost), 0);

    const po = new PurchaseOrder({
      ...data,
      orgId,
      poNumber,
      totalAmount,
      createdBy: userId,
    });
    return po.save();
  }

  static async send(orgId: string, id: string) {
    const po = await assertOwnership(PurchaseOrder, id, orgId);
    if (po.status !== 'draft') {
      const err = new Error('Only draft POs can be sent') as any;
      err.statusCode = 400;
      err.code = 'INVALID_REQUEST';
      throw err;
    }

    po.status = 'sent';
    po.sentAt = new Date();
    await po.save();

    // Send email
    // await sendPurchaseOrderEmail(po.supplierEmail, po); // Need supplier email

    return po;
  }

  static async receive(orgId: string, userId: string, id: string, items: any[]) {
    const po = await assertOwnership(PurchaseOrder, id, orgId);
    if (po.status === 'cancelled' || po.status === 'received') {
      const err = new Error('PO already received or cancelled') as any;
      err.statusCode = 400;
      err.code = 'INVALID_REQUEST';
      throw err;
    }

    for (const item of items) {
      const lineItem = po.lineItems.find(li => li.productId.toString() === item.productId);
      if (lineItem) {
        lineItem.receivedQty += item.receivedQty;
        // Create Movement
        await MovementService.create(orgId, userId, {
          productId: item.productId,
          warehouseId: po.warehouseId,
          type: 'receive',
          quantity: item.receivedQty,
          reference: po.poNumber,
          notes: `Received from PO ${po.poNumber}`,
        });
      }
    }

    // Update status
    const allReceived = po.lineItems.every(li => li.receivedQty >= li.quantity);
    const someReceived = po.lineItems.some(li => li.receivedQty > 0);

    if (allReceived) {
      po.status = 'received';
      po.receivedAt = new Date();
    } else if (someReceived) {
      po.status = 'partially_received';
    }

    return po.save();
  }
}
