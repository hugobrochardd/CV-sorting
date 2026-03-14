import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import profileRoutes from './routes/profileRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoute from './routes/uploadRoute.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function start() {
  await initDB();

  app.use('/profile', profileRoutes);
  app.use('/candidates', candidateRoutes);
  app.use('/candidates', uploadRoute);
  app.use('/analytics', analyticsRoutes);

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
