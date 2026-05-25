const { AppError } = require('../utils/errors');

function requireBody(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === '');
    if (missing.length > 0) {
      return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
    }
    next();
  };
}

module.exports = { requireBody };
