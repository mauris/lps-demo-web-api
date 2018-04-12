const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const router = require('./routes');
const cors = require('cors');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.disable('x-powered-by');
  app.use(helmet());
  if (process.env.HTTPS_ENABLE_REDIRECT) {
    app.use((req, res, next) => {
      if (!req.secure) {
        let destinationArray = [
          'https://',
          req.get('Host'),
          req.url
        ];
        return res
          .redirect(destinationArray.join(''));
      }
      return next();
    });
  }
}

if (process.env.USING_PROXY) {
  app.set('trust proxy', true);
}

if (!process.env.LOG_SILENT) {
  let defaultLoggingFormat = process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev';
  app.use(logger(process.env.LOG_FORMAT || defaultLoggingFormat));
}

function cacheControl(req, res, next) {
  if (req.method !== 'GET') {
    next();
    return;
  }
  // instruct browser to revalidate in 60 seconds
  res.header('Cache-Control', 'max-age=60');
  next();
}

app.use(cacheControl);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router(app);

module.exports = app;
