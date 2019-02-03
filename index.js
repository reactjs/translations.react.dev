const shell = require('shelljs');
const config = require('./config.json');

const {languages} = config;

languages.forEach(({url, defaultBranch}) => {
  shell.exec(`node ./watch.js ${url} ${defaultBranch}`, {async: true});
});
