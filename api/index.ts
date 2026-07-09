import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import { connectToDatabase } from '../backend/core/db.js';
import { responseEngine } from '../backend/middleware/response.js';
import { errorHandler, notFoundHandler } from '../backend/middleware/error.js';
import { requestLogger } from '../backend/middleware/logger.js';
import v1Router from '../backend/v1/index.js';

const app = express();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// --- Security & Basics ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// --- Database Connection ---
// For Vercel serverless, we ensure connection on every request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('DB Connection Error:', err);
    res.status(500).json({ success: false, error: { code: 500, message: 'Database initialization failed' }});
  }
});

// --- Standard Response Engine ---
app.use(responseEngine);

// --- Request Logger ---
app.use(requestLogger);

// --- API Routing ---
// We mount v1 API endpoints
app.use('/api/v1', v1Router);

// Fallback legacy paths to v1 for compatibility with frontend code
app.use('/api', v1Router); 
app.get('/api/user/me', (req, res, next) => {
  req.url = '/system/user/me';
  v1Router(req, res, next);
});

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
