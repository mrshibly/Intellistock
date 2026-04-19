import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';
import { User } from '../modules/users/user.model';
import { Org } from '../modules/orgs/org.model';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccess(token);
    
    const user = await User.findById(decoded.userId).select('+orgId');
    if (!user || user.isDeleted) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found or deleted' },
      });
      return;
    }

    const org = await Org.findById(user.orgId);
    if (!org || !org.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Organization not found or inactive' },
      });
      return;
    }

    req.user = user;
    req.org = org;
    next();
  } catch (error: any) {
    const code = error.code || 'TOKEN_INVALID';
    const message = error.message || 'Invalid token';
    res.status(401).json({
      success: false,
      error: { code, message },
    });
    return;
  }
};
