const fs = require('fs');
const path = require('path');
const glob = require('glob');
const express = require('express');
const marked = require('marked');

const PORT = process.env.PORT || 3001;
const contentPath = path.resolve(__dirname, '../content');
const parsedContentPath = path.resolve(__dirname, '../parsed-content');
let contentUrls = [];

const app = express();

// Checks that the 'content' directory exists and is accessible in the app
fs.access(contentPath, fs.constants.F_OK, (err) => {
  console.log(`${contentPath} ${err ? 'does not exist' : 'exists'}`);
  if (err) throw err;
});

// Could have combined the below functions, but felt it was more
// useful to have them separate, for greater flexibility
const isFile = pathString => fs.statSync(pathString).isFile();
const isMarkdown = pathString => path.extname(pathString) === '.md';

// Function to search directories on 'src' path, and pass expected
// callback function to the glob package function call
const getContentFiles = (src, callback) => glob(src + '/**/*', callback);

getContentFiles(contentPath, (err, res) => {
  if (err) throw err;

  res.map(pathString => {
    if (isFile(pathString) && isMarkdown(pathString)) {
      // path.dirname gives us the absolute path to the file, and removes
      // the file extension from the resulting string.
      // Then use .replace to remove the known path up to and including
      // 'content' dir, which gives us the URL structure they should be
      // accessible on
      const urlPath = path.dirname(pathString).replace(`${contentPath}`, '');
      contentUrls.push(urlPath);

      // comment below this point
      const fileContents = fs.readFileSync(pathString, 'utf-8');
      const fileWithMarkdown = marked.parse(fileContents);
      const newPath = `${parsedContentPath}${urlPath}`;

      fs.mkdir(newPath, { recursive: true }, (err) => {
        if (err) throw err;

        fs.writeFile(`${newPath}/index.html`, fileWithMarkdown, (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      });
    }
  });
});

app.use(contentUrls, (req, res, next) => {
  const { originalUrl = '' } = req;
  const resFilePath = path.join(parsedContentPath, originalUrl, 'index.html');
  res.sendFile(resFilePath);
});

app.get('*', (req, res) => {
  res.status(404).send('<h1>page not found - sorry about that :(</h1>');
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
