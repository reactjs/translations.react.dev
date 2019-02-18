const program = require('commander');
const shell = require('shelljs');

program
  .option('-i, --interval <n>', 'How often to run script', parseInt)
  .option('-u, --unit <string>', 'Unit of time')
  .option('-c, --command <cmd>', 'Command to run')
  .parse(process.argv);

function getMultiplier(unit) {
  switch (unit) {
    case 'ms':
      return 1;
    case 's':
      return 1000;
    case 'm':
      return 60 * 1000;
    case 'h':
      return 60 * 60 * 1000;
    case 'd':
      return 24 * 60 * 60 * 1000;
  }
}

setInterval(() => {
  shell.exec(program.command);
}, program.interval * getMultiplier(program.unit));
