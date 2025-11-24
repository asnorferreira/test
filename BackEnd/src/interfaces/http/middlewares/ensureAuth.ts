import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../domain/services/token';

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'Unauthorized' });
  const [, token] = hdr.split(' ');
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
