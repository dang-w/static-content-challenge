const path = require('path');

const CONTENT_PATH = path.resolve(__dirname, '../content');
const PARSED_CONTENT_PATH = path.resolve(__dirname, '../views/parsed-content');
const MOCK_CONTENT_PATH = path.resolve(__dirname, '../__mocks__/content');
const MOCK_PARSED_CONTENT_PATH = path.resolve(__dirname, '../__mocks__/views/parsed-content');

module.exports = {
  CONTENT_PATH,
  PARSED_CONTENT_PATH,
  MOCK_CONTENT_PATH,
  MOCK_PARSED_CONTENT_PATH,
};
