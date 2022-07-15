const fs = require('fs');
const path = require('path');
const express = require('express');
// const fileUpload = require('express-fileupload');
const nunjucks = require('nunjucks');
const {
  CONTENT_PATH,
  PARSED_CONTENT_PATH,
  MOCK_CONTENT_PATH,
  MOCK_PARSED_CONTENT_PATH,
} = require('../constants');
const { checkDir, parseFiles } = require('../utils');

// below supports testing - if env is test, use paths that lead
// to mock testing data
const nodeEnv = process.env.NODE_ENV;
const contentPath = nodeEnv !== 'test' ? CONTENT_PATH : MOCK_CONTENT_PATH;
const parsedContentPath = nodeEnv !== 'test' ? PARSED_CONTENT_PATH : MOCK_PARSED_CONTENT_PATH;

const app = express();
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', {
  express: app,
  autoescape: true
});
app.set('view engine', 'html');

checkDir(contentPath);
const contentUrls = parseFiles(contentPath, parsedContentPath);

app.get('/', (req, res) => {
  res.status(200).send('<h1>bongiorno</h1>');
});

app.get(contentUrls, (req, res) => {
  try {
    const { originalUrl = '' } = req;
    const resFilePath = path.join(parsedContentPath, originalUrl, 'content.html');
    const content = fs.readFileSync(resFilePath, 'utf8');

    res.render('template.html', { content }, (err, html) => {
      if (err) {
        res.status(404).send('page not found - sorry about that :(');
      }

      res.send(html);
    });
  } catch (err) {
    res.status(404).send('<h1>page not found - sorry about that :(</h1>');
  }
});

app.get('*', (req, res) => {
  res.status(404).send('<h1>page not found - sorry about that :(</h1>');
});

module.exports = app;
