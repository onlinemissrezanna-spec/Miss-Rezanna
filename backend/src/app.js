const fs = require('fs');
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

// Serve static frontend files from __dirname, __dirname/public, and root
const srcDir = __dirname;
const publicDir = path.resolve(__dirname, 'public');
const rootDir = path.resolve(__dirname, '../..');

app.use(express.static(srcDir));
app.use(express.static(publicDir));
app.use(express.static(rootDir));

// Global Interceptor for Admin Portal Requests (Guarantees 200 OK for admin.html)
app.use((req, res, next) => {
    const url = req.url.toLowerCase();
    if (url === '/admin.html' || url === '/admin' || url === '/admin/' || url.startsWith('/admin.html?')) {
        const p0 = path.resolve(__dirname, 'admin.html');
        const p1 = path.resolve(__dirname, 'public/admin.html');
        const p2 = path.resolve(__dirname, '../../admin.html');
        
        if (fs.existsSync(p0)) return res.sendFile(p0);
        if (fs.existsSync(p1)) return res.sendFile(p1);
        if (fs.existsSync(p2)) return res.sendFile(p2);
    }
    next();
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
