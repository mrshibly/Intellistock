import { Request, Response, NextFunction } from 'express';
import { ForecastService } from './forecast.service';

export class ForecastController {
  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const forecast = await ForecastService.getLatestForProduct(req.user.orgId, productId);
      res.json(forecast);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const forecasts = await ForecastService.listForOrg(req.user.orgId);
      res.json(forecasts);
    } catch (error) {
      next(error);
    }
  }

  static async triggerManual(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const forecast = await ForecastService.generateForProduct(req.user.orgId, productId);
      res.status(201).json(forecast);
    } catch (error) {
      next(error);
    }
  }
}
