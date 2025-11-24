import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export const authRoutes = Router();
authRoutes.post('/register', AuthController.register); // body: {name,email,password,referralCode?}
authRoutes.post('/login', AuthController.login);       // body: {email,password}
