import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/models.js';
import { AppError } from '../utils/app-error.js';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access restricted to roles: ${roles.join(', ')}`));
    }

    next();
  };
};

