/**
 * Run [command] on the given [configFile] on all languages in the given [langDir]
 *
 * ```
 * runAll [command] [configfile] [langDir]
 * ```
 */
const fs = require('fs');
const Promise = require('bluebird');
const shell = Promise.promisifyAll(require('shelljs'));
const program = require('commander');

program
  .option('-c, --concurrency <n>', 'Concurrency to run script', parseInt)
  .option('-d, --delete', 'Delete repos afterwards')
  .parse(process.argv);

const [cmd, configFile, langsDir] = program.args;
const langFiles = fs.readdirSync(langsDir);

const opts = `${program.delete ? '-d' : ''}`;

// Make the repo directory now so that child processes don't error out
if (shell.ls('repo').code !== 0) {
  shell.mkdir('repo');
}

// We run the script separately for each language so that the shelljs global state
// (e.g. working directory) doesn't interfere between runs
Promise.map(
  langFiles,
  langFile => {
    const path = `${langsDir}/${langFile}`;
    return shell.execAsync(
      `node scripts/${cmd}.js ${configFile} ${path} ${opts}`,
    );
  },
  {concurrency: program.concurrency || Infinity},
);
