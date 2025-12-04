require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
// Normalize frontend URL (strip trailing slash) and configure CORS to allow credentials
const rawFrontend = process.env.FRONTEND_URL || 'http://localhost:8080';
const allowedOrigin = String(rawFrontend).replace(/\/$/, '');

app.use(cors({
  origin: function (origin, callback) {
    // allow requests like curl/postman with no origin
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Ensure preflight responses are handled
app.options('*', cors({ origin: allowedOrigin, credentials: true, optionsSuccessStatus: 200 }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
});

app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Health check — include a lightweight DB probe so readiness reflects DB state
app.get('/api/health', async (req, res) => {
  try {
    // lightweight DB check
    await db.query('SELECT 1');
    res.json({ status: 'ok', message: 'Server and DB are reachable' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'DB unreachable' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
