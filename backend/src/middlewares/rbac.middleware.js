const ApiError = require('../utils/ApiError');

/**
 * Middleware to check if the authenticated admin has the required permission.
 * Requires the user object to have role.permissions array populated.
 * 
 * @param {string} resource - The resource being accessed (e.g., 'products', 'orders')
 * @param {string} action - The action being performed (e.g., 'read', 'write', 'delete')
 */
const requirePermission = (resource, action) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ApiError(403, 'Access denied. Role not found.'));
        }

        // Super Admin bypasses all checks
        if (user.role.name === 'Super Admin' || user.role.name === 'Admin') {
            return next();
        }

        const requiredPermission = `${resource}:${action}`;
        const permissions = user.role.permissions || [];

        // Check for specific permission or wildcard write (write implies read)
        if (
            permissions.includes(requiredPermission) ||
            permissions.includes(`${resource}:write`) ||
            permissions.includes('all')
        ) {
            return next();
        }

        return next(new ApiError(403, `Access denied. Requires permission: ${requiredPermission}`));
    };
};

module.exports = { requirePermission };
