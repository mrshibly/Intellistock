import { Forecast } from './forecast.model';
import { Movement } from '../movements/movement.model';
import { Product } from '../products/product.model';
import { GroqService } from '../../services/groq.service';
import { assertOwnership } from '../../utils/ownershipCheck';
import mongoose from 'mongoose';

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
}
