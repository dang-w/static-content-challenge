const fs = require('fs');
const path = require('path');
const glob = require('glob');
const marked = require('marked');
const { CONTENT_PATH } = require('../constants');

// Checks that the 'content' directory exists and is accessible in the app
const checkDir = (contentPath) => fs.accessSync(contentPath, fs.constants.F_OK, (err) => {
  console.log(`${contentPath} ${err ? 'does not exist' : 'exists'}`);
  if (err) throw err;
});

// Could have combined the below functions, but felt it was more
// useful to have them separate, for greater flexibility
const isFile = pathString => fs.statSync(pathString).isFile();
const isMarkdown = pathString => path.extname(pathString) === '.md';

// Function to search directories on 'src' path, and pass expected
// callback function to the glob package function call
const getContentFiles = (src) => glob.sync(src + '/**/*');

// !!!!!!!!!! comment on below
const parseFiles = (contentPath, parsedContentPath) => {
  const contentUrls = [];

  getContentFiles(contentPath).forEach(pathString => {
    if (isFile(pathString) && isMarkdown(pathString)) {
      // path.dirname gives us the absolute path to the file, and removes
      // the file extension from the resulting string.
      // Then use .replace to remove the known path up to and including
      // 'content' dir, which gives us the URL structure they should be
      // accessible on
      const urlPath = path.dirname(pathString).replace(`${contentPath}`, '');
      contentUrls.push(urlPath);

      // !!!!!!!!!! comment on below
      const fileContents = fs.readFileSync(pathString, 'utf-8');
      const fileWithMarkdown = marked.parse(fileContents);
      const newPath = `${parsedContentPath}${urlPath}`;

      fs.mkdirSync(newPath, { recursive: true });
      fs.writeFileSync(`${newPath}/content.html`, fileWithMarkdown);
    }
  });

  return contentUrls;
};

const parseContentData = (contentPath, parsedContentPath) => {
  checkDir(contentPath);
  const contentUrls = parseFiles(contentPath, parsedContentPath);
  const navMenu = contentUrls.map((contentUrl) => {
    // Converting URL to link text;
    // lower case all text, remove leading /, replace remaining / with >,
    // replace - with spaces, and trim any remaining whitespace
    const parsedText = contentUrl
      .toLowerCase()
      .replace('/', '')
      .replaceAll('/', ' > ')
      .replaceAll('-', ' ')
      .trim();

    return `<a class="nav-item" href="${contentUrl}">${parsedText}</a>`;
  }).join(' | ');

  return { contentUrls, navMenu };
};

const errorHandler = (res) => {
  const resFilePath = path.join(CONTENT_PATH, '404.html');
  const content = fs.readFileSync(resFilePath, 'utf8');

  res.render('template.html', { content }, (err, html) => {
    res.status(404).send(html);
  });
};

module.exports = {
  // checkDir,
  // parseFiles,
  parseContentData,
  errorHandler,
};