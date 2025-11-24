import { Router } from 'express';
import { ensureAuth } from '../middlewares/ensureAuth';
import { ensureAdmin } from '../middlewares/ensureAdmin';
import { AdminController } from '../controllers/AdminController';

export const adminRoutes = Router();
adminRoutes.use(ensureAuth, ensureAdmin);
adminRoutes.post('/users', AdminController.createUser);
adminRoutes.get('/users', AdminController.listUsers);
