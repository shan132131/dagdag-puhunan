// ============================================================
// DAGDAG PUHUNAN — Express API Server
// ============================================================
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import dotenv  from 'dotenv';
import rateLimit from 'express-rate-limit';
import { globalLimiter } from './middleware/rateLimiters.js';

import { logger }       from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes         from './routes/auth.js';
import applicationRoutes  from './routes/applications.js';
import repaymentRoutes    from './routes/repayments.js';
import userRoutes         from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import auditRoutes        from './routes/audit.js';
import reportRoutes       from './routes/reports.js';
import ciReportRoutes     from './routes/ci_reports.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      connectSrc:  ["'self'", "https://*.supabase.co"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
}));

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Global rate limit ─────────────────────────────────────────
// globalLimiter now imported from middleware/rateLimiters.js
app.use(globalLimiter);

// ── Auth rate limit (stricter) ────────────────────────────────
// authLimiter now imported from middleware/rateLimiters.js

// ── Request logger ────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    ua: req.get('user-agent'),
  });
  next();
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'DAGDAG PUHUNAN API',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/repayments',    repaymentRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit',         auditRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/ci-reports',    ciReportRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`DAGDAG PUHUNAN API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;

