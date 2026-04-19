import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from './purchaseOrder.service';

export class PurchaseOrderController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pos = await PurchaseOrderService.list((req.org._id as any).toString());
      res.status(200).json({ success: true, data: pos });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.getById((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.create((req.org._id as any).toString(), (req.user._id as any).toString(), req.body);
      res.status(201).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async send(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.send((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async receive(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.receive((req.org._id as any).toString(), (req.user._id as any).toString(), req.params.id as string, req.body.lineItems);
      res.status(200).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }
}
