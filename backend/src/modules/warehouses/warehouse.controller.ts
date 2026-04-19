import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from './warehouse.service';

export class WarehouseController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await WarehouseService.list((req.org._id as any).toString());
      res.status(200).json({ success: true, data: warehouses });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await WarehouseService.getById((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await WarehouseService.create(req.org, (req.user._id as any).toString(), req.body);
      res.status(201).json({ success: true, data: warehouse });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await WarehouseService.update((req.org._id as any).toString(), req.params.id as string, req.body);
      res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await WarehouseService.softDelete((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: { message: 'Warehouse deactivated successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
