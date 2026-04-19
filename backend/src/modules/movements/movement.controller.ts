import { Request, Response, NextFunction } from 'express';
import { MovementService } from './movement.service';
import { Movement } from './movement.model';
import { assertOwnership } from '../../utils/ownershipCheck';

export class MovementController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MovementService.list((req.org._id as any).toString(), req.query);
      res.status(200).json({
        success: true,
        data: result.movements,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await MovementService.create((req.org._id as any).toString(), (req.user._id as any).toString(), req.body);
      res.status(201).json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const movement = await assertOwnership(Movement, id as string, (req.org._id as any).toString());
      res.status(200).json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }
}
