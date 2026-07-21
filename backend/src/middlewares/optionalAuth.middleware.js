const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const asyncHandler = require('./asyncHandler');

// This middleware parses the JWT to attach the user if present, but DOES NOT throw an error if the user is a guest.
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, roleId: true, isVerified: true, status: true }
            });

            if (user && user.status === 'active') {
                req.user = user;
            }
        } catch (error) {
            // Token failed, but we ignore it and treat them as a guest
        }
    }

    next();
});

module.exports = { optionalAuth };
