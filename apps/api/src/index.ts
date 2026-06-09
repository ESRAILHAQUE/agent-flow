import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import routes from './routes/index.js';

// ============================================================
// Create Express App
// ============================================================

const app = express();

// ============================================================
// Security Middleware
// ============================================================

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ============================================================
// Body Parsing & Logging
// ============================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ============================================================
// Routes
// ============================================================

app.use('/api', routes);

// ============================================================
// Error Handling
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

app.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🚀 AgentFlow API Server                     ║
  ║                                               ║
  ║   Port:        ${config.port}                          ║
  ║   Environment: ${config.env.padEnd(27)}║
  ║   URL:         ${config.apiUrl.padEnd(27)}║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
