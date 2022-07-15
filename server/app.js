const fs = require('fs');
const path = require('path');
const express = require('express');
// const fileUpload = require('express-fileupload');
const marked = require('marked');
const nunjucks = require('nunjucks');
const {
  CONTENT_PATH,
  PARSED_CONTENT_PATH,
  MOCK_CONTENT_PATH,
  MOCK_PARSED_CONTENT_PATH,
} = require('../constants');
const {
  checkDir,
  isFile,
  isMarkdown,
  getContentFiles,
} = require('../utils');

// below supports testing - if env is test, use paths that lead
// to mock testing data
const nodeEnv = process.env.NODE_ENV;
const contentPath = nodeEnv !== 'test' ? CONTENT_PATH : MOCK_CONTENT_PATH;
const parsedContentPath = nodeEnv !== 'test' ? PARSED_CONTENT_PATH : MOCK_PARSED_CONTENT_PATH;
let contentUrls = [];

const app = express();
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', {
  express: app,
  autoescape: true
});
app.set('view engine', 'html');

checkDir(contentPath);

getContentFiles(contentPath).forEach(pathString => {
    if (isFile(pathString) && isMarkdown(pathString)) {
      // path.dirname gives us the absolute path to the file, and removes
      // the file extension from the resulting string.
      // Then use .replace to remove the known path up to and including
      // 'content' dir, which gives us the URL structure they should be
      // accessible on
      const urlPath = path.dirname(pathString).replace(`${contentPath}`, '');
      contentUrls.push(urlPath);

      // comment on below
      const fileContents = fs.readFileSync(pathString, 'utf-8');
      const fileWithMarkdown = marked.parse(fileContents);
      const newPath = `${parsedContentPath}${urlPath}`;

      fs.mkdirSync(newPath, { recursive: true });
      fs.writeFileSync(`${newPath}/content.html`, fileWithMarkdown);
    }
  });

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
