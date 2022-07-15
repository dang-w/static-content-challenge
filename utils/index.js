const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

module.exports = {
  checkDir,
  isFile,
  isMarkdown,
  getContentFiles,
};