import { Router } from 'express';
import { getStatus, requestQr } from '../controllers/whatsappController';

const router = Router();
router.get('/status', getStatus);
router.get('/qr', requestQr);

export default router;
