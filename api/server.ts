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

// CORS configuration — allow localhost for dev and any Netlify subdomain for all deploy contexts
const allowedOrigins = [
  process.env['URL'],              // primary site URL (e.g. https://maryoak.netlify.app)
  process.env['DEPLOY_PRIME_URL'], // deploy preview URL (e.g. https://deploy-preview-1--maryoak.netlify.app)
  process.env['FRONTEND_URL'],
  'http://localhost:4200',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Accept any Netlify subdomain (covers all deploy previews automatically)
    if (origin.endsWith('.netlify.app')) return callback(null, true);
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

// Start server only when running locally — never in a Netlify/Lambda serverless environment
if (!process.env['AWS_LAMBDA_FUNCTION_NAME'] && !process.env['NETLIFY_LOCAL']) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📝 Appointments API: http://localhost:${PORT}/api/appointments`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for serverless
export default app;
