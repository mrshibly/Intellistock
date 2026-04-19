import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getMe((req.user._id as any).toString());
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateMe((req.user._id as any).toString(), req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.softDeleteMe((req.user._id as any).toString(), req.body.confirmText);
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, data: { message: 'Account deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }

  static async exportMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.exportMe((req.user._id as any).toString());
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
