const fs = require('fs');
const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const {
  CONTENT_PATH,
  PARSED_CONTENT_PATH,
  MOCK_CONTENT_PATH,
  MOCK_PARSED_CONTENT_PATH,
} = require('../constants');
const { checkDir, parseFiles, errorHandler } = require('../utils');

// below supports testing - if env is test, use paths that lead
// to mock testing data
const nodeEnv = process.env.NODE_ENV;
const contentPath = nodeEnv !== 'test' ? CONTENT_PATH : MOCK_CONTENT_PATH;
const parsedContentPath = nodeEnv !== 'test' ? PARSED_CONTENT_PATH : MOCK_PARSED_CONTENT_PATH;

const app = express();
app.use(express.static(path.join(__dirname , '../static')));
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', {
  express: app,
  autoescape: true
});
app.set('view engine', 'html');

checkDir(contentPath);
const contentUrls = parseFiles(contentPath, parsedContentPath);

app.get('/', (req, res) => {
  const resFilePath = path.join(contentPath, 'landing.html');
  const content = fs.readFileSync(resFilePath, 'utf8');

  res.render('template.html', { content }, (err, html) => {
    if (err) {
      errorHandler(res);
    }

    res.send(html);
  });
});

app.get(contentUrls, (req, res) => {
  try {
    const { originalUrl = '' } = req;
    const resFilePath = path.join(parsedContentPath, originalUrl, 'content.html');
    const content = fs.readFileSync(resFilePath, 'utf8');

    res.render('template.html', { content }, (err, html) => {
      if (err) {
        errorHandler(res);
      }

      res.send(html);
    });
  } catch (err) {
    errorHandler(res);
  }
});

app.get('*', (req, res) => {
  errorHandler(res);
});

module.exports = app;
