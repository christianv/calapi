var caldining = require('./caldining');

/**
 * GET /api
 * List of API examples.
 */

exports.getApi = function(req, res) {
  res.json({
    title: 'hey'
  });
};

/**
 * GET /api/caldining
 * Get all the caldining information
 */

exports.getMenu = caldining.get;
