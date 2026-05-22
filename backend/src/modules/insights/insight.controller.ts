import { Request, Response, NextFunction } from 'express';
import { InsightService } from './insight.service';

export class InsightController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await InsightService.list((req.org._id as any).toString());
      res.json(insights);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const insight = await InsightService.markAsRead((req.org._id as any).toString(), id as string);
      res.json(insight);
    } catch (error) {
      next(error);
    }
  }

  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      const { GroqService } = require('../../services/groq.service');
      const answer = await GroqService.chatQuery((req.org._id as any).toString(), message, history);
      res.json({ answer });
    } catch (error) {
      next(error);
    }
  }

  static async triggerManual(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await InsightService.generateForOrg((req.org._id as any).toString());
      res.status(201).json(insights);
    } catch (error) {
      next(error);
    }
  }
}
