import { Router } from 'express';
import { ensureAuth } from '../middlewares/ensureAuth';
import { AffiliateController } from '../controllers/AffiliateController';

export const affiliateRoutes = Router();
affiliateRoutes.post('/', ensureAuth, AffiliateController.create);
affiliateRoutes.get('/r/:code', AffiliateController.redirect); // público
