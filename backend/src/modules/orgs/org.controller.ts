import { Request, Response, NextFunction } from 'express';
import { OrgService } from './org.service';

export class OrgController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrgService.getMe((req.org._id as any).toString());
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrgService.updateMe((req.org._id as any).toString(), req.body);
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await OrgService.getMembers((req.org._id as any).toString());
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await OrgService.updateMemberRole((req.org._id as any).toString(), userId as string, (req.user._id as any).toString(), role);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
