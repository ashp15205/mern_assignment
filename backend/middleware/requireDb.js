const { AppError } = require('../utils/errors');
const { isDbReady } = require('../config/db');

/** Block data routes when MongoDB is unavailable — avoids opaque driver errors. */
function requireDb(req, res, next) {
  if (!isDbReady()) {
    return next(
      new AppError(
        'Database is unavailable. Start MongoDB and retry, or check MONGODB_URI.',
        503
      )
    );
  }
  next();
}

module.exports = requireDb;
