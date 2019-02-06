const shell = require('shelljs');
const languages = require('../languages.json');

const [configFile] = process.argv.slice(2);
languages.forEach(({code}) => {
  shell.exec(`node scripts/watch.js ${configFile} ${code}`, {async: true});
});
