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
const { parseContentData, errorHandler } = require('../utils');

// below supports testing - if env is test, use paths that lead
// to mock testing data
const nodeEnv = process.env.NODE_ENV;
const contentPath = nodeEnv !== 'test' ? CONTENT_PATH : MOCK_CONTENT_PATH;
const parsedContentPath = nodeEnv !== 'test' ? PARSED_CONTENT_PATH : MOCK_PARSED_CONTENT_PATH;

const app = express();
app.use(express.static(path.join(__dirname , '../static')));
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
// templating engine to add html fragments into template file
nunjucks.configure('views', {
  express: app,
  autoescape: true
});
app.set('view engine', 'html');

const { contentUrls, navMenu } = parseContentData(contentPath, parsedContentPath);

app.get('/', (req, res) => {
  const resFilePath = path.join(contentPath, 'landing.html');
  const content = fs.readFileSync(resFilePath, 'utf8');

  res.render('template.html', { content, nav: navMenu }, (err, html) => {
    if (err) {
      errorHandler(res);
    }

    res.send(html);
  });
});

app.get('/new-content', (req, res) => {
  const resFilePath = path.join(contentPath, 'editor.html');
  const content = fs.readFileSync(resFilePath, 'utf8');

  res.render('template.html', { content, nav: navMenu }, (err, html) => {
    if (err) {
      errorHandler(res);
    }

    res.send(html);
  });
});

app.post('/upload', express.json(), (req, res) => {
  // handler for adding new markdown files
  // creates new directory path and writes markdown to new
  // md file
  const { markdown, filepath } = req.body;

  fs.mkdirSync(`${contentPath}/${filepath}`, { recursive: true });
  fs.writeFileSync(`${contentPath}/${filepath}/index.md`, markdown);

  res.redirect('/');
});

app.get(contentUrls, (req, res) => {
  // route handler for all content found and parsed in the
  // content dir - contentUrls is the array of paths to these
  // parsed files returned from the parseContentData util function
  try {
    const { originalUrl = '' } = req;
    const resFilePath = path.join(parsedContentPath, originalUrl, 'content.html');
    const content = fs.readFileSync(resFilePath, 'utf8');

    res.render('template.html', { content, nav: navMenu }, (err, html) => {
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
  // handler for any other routes - returns 404 page
  errorHandler(res);
});

module.exports = app;
