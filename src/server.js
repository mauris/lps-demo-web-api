const http = require('http');
const debug = require('debug')('server');
const app = require('./app');

/*
 * Event listener for HTTP server "error" event.
 */
function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(bind + ' requires elevated privileges');
      throw new Error('Insufficient privileges');
    case 'EADDRINUSE':
      debug(bind + ' is already in use');
      throw new Error('Port in use');
    default:
      throw error;
  }
}

/*
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = {
  start: (port) => {
    app.set('port', port);

    let server = http.createServer(app);

    server.on('error', (error) => {
      onError(error, port);
    });

    server.on('listening', () => {
      onListening(server);
    });

    server.listen(port);
    return server;
  }
};
