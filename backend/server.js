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

console.log('Starting server...');
console.log('PORT from env:', process.env.PORT);
console.log('Will listen on port:', PORT);

// CORS configuration - Railway-compatible version
const rawFrontend = process.env.FRONTEND_URL || 'http://localhost:8080';
const allowedOrigin = String(rawFrontend).replace(/\/$/, '');

console.log('CORS Configuration:');
console.log('  Raw FRONTEND_URL:', rawFrontend);
console.log('  Allowed Origin:', allowedOrigin);

// Single CORS middleware - Railway-optimized (MUST be before other middleware)
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS request from origin:', origin || '(no origin header)');
    // Allow requests with no origin (Postman, curl, Railway internal health checks)
    if (!origin) {
      console.log('  ✓ No origin - allowed');
      return callback(null, true);
    }
    // Allow the configured frontend origin
    if (origin === allowedOrigin) {
      console.log('  ✓ Origin allowed');
      return callback(null, true);
    }
    // CRITICAL: Return false instead of Error to avoid 500 status that causes 502
    console.warn('  ✗ CORS rejected origin:', origin, '(expected:', allowedOrigin, ')');
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204  // Railway prefers 204 for OPTIONS
}));

// Security middleware (after CORS to avoid conflicts)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

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

// Root health check for Railway (must respond with 200)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Undertale/Deltarune Fight Sim API',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Health check with DB probe
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

// Start server - bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV}\`);
  console.log('Server is ready to accept connections');
});
