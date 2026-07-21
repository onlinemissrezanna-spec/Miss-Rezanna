const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return next(new ApiError(400, error.errors.map(e => e.message).join(', ')));
    }
};

module.exports = validate;
