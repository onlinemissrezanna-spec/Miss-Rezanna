const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
    // If browser request accepts HTML and is not an API call, serve branded 404.html
    if (req.accepts('html') && !req.originalUrl.startsWith('/api/')) {
        const p404 = path.join(process.cwd(), '404.html');
        if (fs.existsSync(p404)) {
            return res.status(404).sendFile(p404);
        }
    }
    next(new ApiError(404, 'Route Not Found - ' + req.originalUrl));
};

module.exports = { notFound };
