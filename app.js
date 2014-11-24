var express = require('express');
var compress = require('compression');
var path = require('path');

var apiController = require('./controllers/api');

/**
 * Create Express server.
 */
var app = express();

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
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
