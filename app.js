var express = require('express');
var compress = require('compression');
var path = require('path');

var apiController = require('./controllers/api');

/**
 * Create Express server.
 */
var app = express();

/**
 * Allow Cross Domain
 */
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(allowCrossDomain);
app.use(compress());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Route configuration.
 */
app.get('/api', apiController.getApi);
app.get('/api/caldining', apiController.getMenu);

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});


module.exports = app;
