import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { appointmentsRouter } from './routes/appointments';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/appointments', appointmentsRouter);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3333);

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
