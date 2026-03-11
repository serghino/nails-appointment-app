import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import appointmentsRouter from './appointments/index';

// Load environment variables from api directory
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

console.log('🚀 Starting API server...');

const app: Express = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration — DEPLOY_PRIME_URL is set automatically by Netlify for every context
// (production, deploy previews, branch deploys). Falls back to FRONTEND_URL or localhost.
const allowedOrigins = [
  process.env['DEPLOY_PRIME_URL'],
  process.env['FRONTEND_URL'],
  'http://localhost:4200',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// API Routes
app.use('/api/appointments', appointmentsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined
  });
});

// Start server (only if not in serverless mode)
if (process.env['NODE_ENV'] !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📝 Appointments API: http://localhost:${PORT}/api/appointments`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for serverless
export default app;
