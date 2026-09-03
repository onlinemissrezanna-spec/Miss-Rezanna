const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Create logs directory safely — won't crash if it can't be created
const logDir = path.join(__dirname, '../../logs');
if (!isServerless) {
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    } catch (e) {
        // Ignore — will fall back to console only
    }
}

const transports = [
    // Always log to console so Railway can capture logs
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })
];

// Only add file transports if not in a serverless environment (Vercel, Lambda) where filesystem is read-only
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!isServerless) {
    try {
        if (fs.existsSync(logDir)) {
            const DailyRotateFile = require('winston-daily-rotate-file');
            transports.push(new DailyRotateFile({
                filename: `${logDir}/application-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }));
            transports.push(new winston.transports.File({
                filename: `${logDir}/error.log`,
                level: 'error'
            }));
        }
    } catch (e) {
        console.warn('File logging unavailable, using console only:', e.message);
    }
}

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports
});

module.exports = logger;
