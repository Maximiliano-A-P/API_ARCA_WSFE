import express from 'express';
import cors from 'cors';
import { wsfeConfig } from './config/wsfe.config';
import wsfeRoutes from './routes/wsfe.routes';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/wsfe', wsfeRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(wsfeConfig.port, () => {
  console.log(`arca-api corriendo en puerto ${wsfeConfig.port}`);
});