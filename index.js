const shell = require('shelljs');
const languages = require('./languages.json');

languages.forEach(({code}) => {
  shell.exec(`node ./watch.js ${code}`, {async: true});
});
