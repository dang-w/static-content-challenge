const fs = require('fs');
const path = require('path');
const glob = require('glob');
const express = require('express');
// const fileUpload = require('express-fileupload');
const marked = require('marked');
const nunjucks = require('nunjucks');

const PORT = process.env.PORT || 3001;
const contentPath = path.resolve(__dirname, '../content');
const parsedContentPath = path.resolve(__dirname, '../views/parsed-content');
let contentUrls = [];

const app = express();
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', {
  express: app,
  autoescape: true
});
app.set('view engine', 'html');

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




      // comment on below
      const fileContents = fs.readFileSync(pathString, 'utf-8');
      const fileWithMarkdown = marked.parse(fileContents);
      const newPath = `${parsedContentPath}${urlPath}`;

      fs.mkdir(newPath, { recursive: true }, (err) => {
        if (err) throw err;

        fs.writeFile(`${newPath}/content.html`, fileWithMarkdown, (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      });
    }
  });
});


// app.use(fileUpload());

// app.get('/', (req, res) => {
//   res.render('template.html', { content: });
// });

// app.post('/upload', function(req, res) {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.');
//   }

//   console.log('req.files:', req.files);

//   // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//   // let sampleFile = req.files.sampleFile;

//   // Use the mv() method to place the file somewhere on your server
//   // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
//   //   if (err)
//   //     return res.status(500).send(err);

//   //   res.send('File uploaded!');
//   // });
// });

app.use(contentUrls, (req, res, next) => {
  const { originalUrl = '' } = req;
  const resFilePath = path.join(parsedContentPath, originalUrl, 'content.html');
  const content = fs.readFileSync(resFilePath, 'utf8');

  res.render('template.html', { content }, (err, html) => {
    if (err) {
      res.writeHead(404);
      res.write('page not found - sorry about that :(');
      throw err;
    }

    res.send(html);
  });
});

app.get('*', (req, res) => {
  res.status(404).send('<h1>page not found - sorry about that :(</h1>');
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
