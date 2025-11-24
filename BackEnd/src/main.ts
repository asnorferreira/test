import * as dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import { authRoutes } from './interfaces/http/routes/auth.routes';
import { adminRoutes } from './interfaces/http/routes/admin.routes';
import { affiliateRoutes } from './interfaces/http/routes/affiliate.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', affiliateRoutes); // /r/:code

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`HTTP server running on :${PORT}`));
