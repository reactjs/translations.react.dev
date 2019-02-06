const shell = require('shelljs');
const languages = require('./languages.json');

const [command] = process.argv.slice(2);
const script = getScript(command);

languages.forEach(({code}) => {
  shell.exec(`node scripts/${script}.js ${code}`, {async: true});
});

function getScript(cmd) {
  switch (cmd) {
    case 'watch':
      return 'watch';
    case 'create':
      return 'createTranslation';
  }
}
