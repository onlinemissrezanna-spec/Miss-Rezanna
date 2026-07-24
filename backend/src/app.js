const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');

const routes = require('./routes/v1');
const { errorHandler } = require('./middlewares/errorHandler');
const { notFound } = require('./middlewares/notFound');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Set security HTTP headers (disable contentSecurityPolicy for inline scripts and embeds)
app.use(helmet({ contentSecurityPolicy: false }));

// GZIP compression
app.use(compression());

// Parse JSON request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Enable CORS
app.use(cors());
app.options('*', cors());

// HTTP request logger
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Serve static website & admin files from repository root
const rootPath = path.join(__dirname, '../..');
app.use(express.static(rootPath));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'API is running successfully' }));

// Dedicated route for admin portal
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(rootPath, 'admin.html'));
});

// v1 API routes
app.use('/api/v1', routes);

// Handle 404
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
