import { Request, Response, NextFunction } from 'express';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      });
      return;
    }
    next();
  };
};
