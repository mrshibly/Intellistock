import cron from 'node-cron';
import { InsightService } from '../modules/insights/insight.service';
import { ForecastService } from '../modules/forecasts/forecast.service';
import { Product } from '../modules/products/product.model';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

export const initCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Starting daily AI insights and forecasting job...');
    await CronService.processAllOrganizations();
  });
};

export class CronService {

  static async processAllOrganizations() {
    try {
      // Get all unique organization IDs from products (as a proxy for active orgs)
      const orgIds = await Product.distinct('orgId', { isDeleted: false });

      for (const orgId of orgIds) {
        logger.info(`Processing AI tasks for Org: ${orgId}`);
        
        // 1. Generate general insights
        try {
          await InsightService.generateForOrg(orgId.toString());
        } catch (err) {
          logger.error(`Error generating insights for Org ${orgId}:`, err);
        }

        // 2. Generate forecasts for all products in org
        const products = await Product.find({ orgId, isDeleted: false }).select('_id');
        for (const product of products) {
          try {
            await ForecastService.generateForProduct(orgId.toString(), product._id.toString());
          } catch (err) {
            logger.error(`Error generating forecast for Product ${product._id}:`, err);
          }
        }
      }
      logger.info('Daily AI jobs completed.');
    } catch (err) {
      logger.error('Critical error in CronService:', err);
    }
  }
}
