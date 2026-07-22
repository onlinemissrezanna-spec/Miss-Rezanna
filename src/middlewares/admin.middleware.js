const ApiError = require('../utils/ApiError');

const adminOnly = (req, res, next) => {
    // protect middleware must run before this
    if (req.user && req.user.role && req.user.role.name === 'Admin') {
        next();
    } else {
        return next(new ApiError(403, 'Access denied. Admin authorization required.'));
    }
};

module.exports = { adminOnly };
