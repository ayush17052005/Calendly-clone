const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
    // A simple validation middleware wrapper
    // In a real app, integrate Joi or express-validator here.
    // For now, we assume schema is a function that returns null if valid, or error message string if invalid.
    
    if (schema) {
        const error = schema(req.body);
        if (error) {
            return next(new BadRequestError(error));
        }
    }
    next();
};

module.exports = validate;
