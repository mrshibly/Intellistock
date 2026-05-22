import { Forecast } from './forecast.model';
import { Movement } from '../movements/movement.model';
import { Stock } from '../movements/stock.model';
import { Product } from '../products/product.model';
import { GroqService } from '../../services/groq.service';
import { assertOwnership } from '../../utils/ownershipCheck';
import mongoose from 'mongoose';

const REORDER_COVERAGE_DAYS = 14;

export class ForecastService {
  static async generateForProduct(orgId: string, productId: string) {
    const product = await assertOwnership(Product, productId, orgId);
    
    // Get last 6 months of sales data (type: 'sell')
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const movements = await Movement.find({
      orgId,
      productId,
      type: 'sell',
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: 1 });

    // Call Groq AI to predict demand
    const prediction = await GroqService.forecastDemand(product, movements);

    // Save forecast
    const forecast = new Forecast({
      productId,
      orgId,
      predictedDemand: prediction.predictedDemand,
      confidence: prediction.confidence,
      period: prediction.period,
      reasoning: prediction.reasoning
    });

    return forecast.save();
  }

  static async getLatestForProduct(orgId: string, productId: string) {
    await assertOwnership(Product, productId, orgId);
    return Forecast.findOne({ orgId, productId }).sort({ period: -1 });
  }

  static async listForOrg(orgId: string) {
    return Forecast.find({ orgId }).sort({ period: -1 }).populate('productId', 'name sku');
  }

  static async generateForOrg(orgId: string) {
    const products = await Product.find({ orgId, isDeleted: false }).select('_id');
    const forecasts = [];

    for (const product of products) {
      forecasts.push(await this.generateForProduct(orgId, (product._id as any).toString()));
    }

    return forecasts;
  }

  static async getReorderPlan(orgId: string) {
    const [products, stockTotals, outboundMovements] = await Promise.all([
      Product.find({ orgId, isDeleted: false })
        .populate('supplierId', 'name leadTimeDays')
        .lean(),
      Stock.aggregate([
        { $match: { orgId: new mongoose.Types.ObjectId(orgId) } },
        { $group: { _id: '$productId', quantity: { $sum: '$quantity' } } },
      ]),
      Movement.find({
        orgId,
        type: { $in: ['sell', 'write_off'] },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }).lean(),
    ]);

    const stockByProduct = new Map<string, number>();
    stockTotals.forEach((item: any) => stockByProduct.set(item._id.toString(), item.quantity));

    const outboundByProduct = new Map<string, number>();
    outboundMovements.forEach((movement: any) => {
      const productId = movement.productId.toString();
      outboundByProduct.set(productId, (outboundByProduct.get(productId) || 0) + movement.quantity);
    });

    return products
      .map((product: any) => {
        const productId = product._id.toString();
        const currentStock = stockByProduct.get(productId) || 0;
        const thirtyDayDemand = outboundByProduct.get(productId) || 0;
        const dailyDemand = thirtyDayDemand / 30;
        const reorderPoint = product.reorderPoint || 0;
        const leadTimeDays = product.supplierId?.leadTimeDays || 7;
        const daysUntilReorder = dailyDemand > 0
          ? Math.max(0, Math.floor((currentStock - reorderPoint) / dailyDemand))
          : null;
        const coverageTarget = dailyDemand * (leadTimeDays + REORDER_COVERAGE_DAYS) + reorderPoint;
        const suggestedReorderQty = Math.max(
          product.reorderQty || 0,
          Math.ceil(coverageTarget - currentStock),
          0
        );
        const status = currentStock <= reorderPoint
          ? 'critical'
          : daysUntilReorder !== null && daysUntilReorder <= leadTimeDays
            ? 'order_soon'
            : 'healthy';

        return {
          productId,
          productName: product.name,
          sku: product.sku,
          unitCost: product.costPrice || 0,
          supplierId: product.supplierId?._id,
          supplierName: product.supplierId?.name || 'Unassigned',
          currentStock,
          reorderPoint,
          thirtyDayDemand,
          dailyDemand: Number(dailyDemand.toFixed(2)),
          leadTimeDays,
          daysUntilReorder,
          suggestedReorderQty,
          status,
        };
      })
      .filter((item) => item.status !== 'healthy' || item.suggestedReorderQty > 0)
      .sort((a, b) => {
        const statusRank: Record<string, number> = { critical: 0, order_soon: 1, healthy: 2 };
        return statusRank[a.status] - statusRank[b.status] || (a.daysUntilReorder ?? 9999) - (b.daysUntilReorder ?? 9999);
      });
  }
}
