const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { html: adminHtml, js: adminJs, css: adminCss } = require('./adminHtmlContent');

const routes = require('./routes/v1');
const { errorHandler } = require('./middlewares/errorHandler');
const { notFound } = require('./middlewares/notFound');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// GZIP compression
app.use(compression());

// Enable CORS
app.use(cors());
app.options('*', cors());

// Parse JSON & urlencoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logger
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const path = require('path');

// Serve static product images
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// Direct in-memory Admin Portal routes for root / and /admin.html (Guarantees 200 OK)
app.get(['/', '/admin', '/admin.html', '/api/v1/admin-portal', '/api/v1/admin.html'], (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(adminHtml);
});

app.get(['/js/admin.js', '/admin.js', '/api/v1/js/admin.js', '/api/v1/admin.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send(adminJs);
});

app.get(['/css/admin.css', '/admin.css', '/api/v1/css/admin.css', '/api/v1/admin.css'], (req, res) => {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.status(200).send(adminCss);
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'API is running successfully' }));

// Rate Limiting for API routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// v1 API routes
app.use('/api/v1', routes);

// Handle 404
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
