const program = require('commander');
const shell = require('shelljs');
const log4js = require('log4js');
const {CronJob} = require('cron');

const logger = log4js.getLogger('watch');

program
  .option('-p, --pattern <pattern>', 'Cron pattern to run')
  .option('-c, --command <cmd>', 'Command to run')
  .parse(process.argv);

logger.info('Starting watch process...');

new CronJob(
  program.pattern,
  () => {
    logger.info(`Running ${program.command}`);
    shell.exec(program.command);
  },
  null,
  true,
  'America/Los_Angeles',
);
