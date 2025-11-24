import { Request, Response, NextFunction } from 'express';

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user;
  if (!u || u.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}
