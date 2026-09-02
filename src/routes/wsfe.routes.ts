import { Router } from 'express';
import { solicitarCaeController, ultimoComprobanteController } from '../controllers/wsfe.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rateLimitPorCuit } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);
router.use(rateLimitPorCuit);

router.post('/solicitar-cae', solicitarCaeController);
router.get('/ultimo-comprobante', ultimoComprobanteController);

export default router;