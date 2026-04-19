import { Insight } from './insight.model';
import { Product } from '../products/product.model';
import { Movement } from '../movements/movement.model';
import { Stock } from '../movements/stock.model';
import { GroqService } from '../../services/groq.service';

export class InsightService {
  static async generateForOrg(orgId: string) {
    // 1. Fetch current inventory state
    const lowStockItems = await Product.find({ orgId, isDeleted: false }); // Placeholder: need to join with stock
    const stocks = await Stock.find({ orgId }).populate('productId');
    
    // 2. Fetch recent movements (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const movements = await Movement.find({
      orgId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 3. Prepare context for Groq
    const context = {
      stockLevels: stocks.map(s => ({
        product: (s.productId as any).name,
        quantity: s.quantity,
        reorderPoint: (s.productId as any).reorderPoint
      })),
      recentActivityCount: movements.length,
      topMovedItems: this.getTopMovedItems(movements)
    };

    // 4. Get insights from Groq
    const aiInsights = await GroqService.detectAnomalies(movements); // Also use for optimization tips
    
    // 5. Save and return insights
    const savedInsights = [];
    for (const aiInsight of aiInsights) {
      const insight = new Insight({
        orgId,
        type: aiInsight.type,
        content: aiInsight.content,
        severity: aiInsight.severity,
        metadata: aiInsight.metadata
      });
      savedInsights.push(await insight.save());
    }

    return savedInsights;
  }

  static async list(orgId: string) {
    return Insight.find({ orgId }).sort({ createdAt: -1 }).limit(50);
  }

  static async markAsRead(orgId: string, insightId: string) {
    return Insight.findOneAndUpdate({ _id: insightId, orgId }, { isRead: true }, { new: true });
  }

  private static getTopMovedItems(movements: any[]) {
    const counts: any = {};
    movements.forEach(m => {
      counts[m.productId] = (counts[m.productId] || 0) + m.quantity;
    });
    return Object.entries(counts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5);
  }
}
