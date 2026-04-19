import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.list((req.org._id as any).toString(), req.query);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create((req.org._id as any).toString(), (req.user._id as any).toString(), req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.update((req.org._id as any).toString(), req.params.id as string, (req.user._id as any).toString(), req.body);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.softDelete((req.org._id as any).toString(), req.params.id as string);
      res.status(200).json({ success: true, data: { message: 'Product deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
