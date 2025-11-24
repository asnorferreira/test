import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export type JwtPayload = { sub: string; role: 'ADMIN' | 'USER' };

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
