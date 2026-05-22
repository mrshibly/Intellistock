import { Request, Response, NextFunction } from 'express';
import { ForecastService } from './forecast.service';

export class ForecastController {
  static async reorderPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await ForecastService.getReorderPlan((req.org._id as any).toString());
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const forecast = await ForecastService.getLatestForProduct((req.org._id as any).toString(), productId as string);
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const forecasts = await ForecastService.listForOrg((req.org._id as any).toString());
      res.json({ success: true, data: forecasts });
    } catch (error) {
      next(error);
    }
  }

  static async generateAll(req: Request, res: Response, next: NextFunction) {
    try {
      const forecasts = await ForecastService.generateForOrg((req.org._id as any).toString());
      res.status(201).json({ success: true, data: forecasts });
    } catch (error) {
      next(error);
    }
  }

  static async triggerManual(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const forecast = await ForecastService.generateForProduct((req.org._id as any).toString(), productId as string);
      res.status(201).json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }
}
