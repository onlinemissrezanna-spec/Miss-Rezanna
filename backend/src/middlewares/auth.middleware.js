const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/db');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new ApiError(401, 'Not authorized, no token provided'));
    }

    try {
        const decoded = verifyToken(token);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { role: true },
        });

        if (!user) return next(new ApiError(401, 'User no longer exists'));
        if (user.status !== 'active') return next(new ApiError(401, 'User account is inactive'));

        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Not authorized, token failed'));
    }
});

module.exports = { protect };
