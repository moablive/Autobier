// src/routes/health.routes.ts
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const healthRoutes = Router();
const healthController = new HealthController();

// GET /api/health/
healthRoutes.get('/', healthController.handle);

export { healthRoutes };