import { Request, Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service';

export class SupplierController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await SupplierService.list((req.org._id as any).toString());
      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.getById((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.create((req.org._id as any).toString(), (req.user._id as any).toString(), req.body);
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.update((req.org._id as any).toString(), req.params.id as string, req.body);
      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SupplierService.softDelete((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: { message: 'Supplier deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
