const fs = require('fs');
const path = require('path');

const API_PREFIX = '';
const ENDPOINTS_PATH = path.join(__dirname, 'endpoints');

function setupErrorHandling(app) {
  // eslint-disable-next-line max-params
  app.use((err, req, res, next) => {
    if (err) {
      return next(err);
    }
    if (req.accepts('json')) {
      return res
        .status(404)
        .json({
          status: 'error',
          msg: 'The resource is not found.'
        });
    }

    return res
      .status(406)
      .send('Page not found');
  });
  // error handlers

  // development error handler
  // will print stacktrace
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line max-params, no-unused-vars
    app.use((err, req, res, next) => {
      return res
        .status(err.status || 500)
        .json({
          msg: err.message,
          status: 'error',
          err: err
        });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  // eslint-disable-next-line max-params, no-unused-vars
  app.use((err, req, res, next) => {
    return res
      .status(err.status || 500)
      .json({
        msg: err.message,
        status: 'error'
      });
  });
}

function handleEndpointFiles(app, files) {
  files
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      const filepath = path.join(ENDPOINTS_PATH, file);
      const route = API_PREFIX + '/' + file.substring(0, file.length - 3);
      // eslint-disable-next-line global-require
      app.use(route, require(filepath));
    });
}

module.exports = (app) => {
  fs.readdir(ENDPOINTS_PATH, (err, files) => {
    if (err) {
      throw err;
    }
    handleEndpointFiles(app, files);
    setupErrorHandling(app);
  });
};
