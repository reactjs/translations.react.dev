const fs = require('fs');

function getJSON(file) {
  // Get content from file
  return JSON.parse(fs.readFileSync(file));
}

module.exports = {
  getJSON,
};
