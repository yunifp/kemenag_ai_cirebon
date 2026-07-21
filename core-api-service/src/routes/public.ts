import { Router } from 'express';
import { getPublicDocuments, getDashboardStats } from '../controllers/publicController';

const router = Router();
router.get('/documents', getPublicDocuments);
router.get('/stats', getDashboardStats);

export default router;
