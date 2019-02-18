const shell = require('shelljs');
const log4js = require('log4js');
const Octokit = require('@octokit/rest');
const program = require('commander');
const {getJSON} = require('../util');
// shell.config.silent = true;

program // options
  .option('-d, --delete', 'Delete repo when done')
  .parse(process.argv);

const [srcConfigFile, langConfigFile] = program.args;
if (!srcConfigFile) {
  throw new Error('Source config file not provided');
}
if (!langConfigFile) {
  throw new Error('Language config file not provided');
}

const {owner, repository} = getJSON(srcConfigFile);
const {code: langCode} = getJSON(langConfigFile);

const logger = log4js.getLogger(langCode);
logger.level = 'info';

const originalUrl = `https://github.com/${owner}/${repository}.git`;

const transRepoName = `${langCode}.${repository}`;
const transUrl = `https://github.com/${owner}/${transRepoName}.git`;
const defaultBranch = 'master';

// Set up
if (shell.cd('repo').code !== 0) {
  shell.mkdir('repo');
  shell.cd('repo');
}

if (shell.cd(transRepoName).code !== 0) {
  logger.info("Can't find translation repo locally. Cloning...");
  shell.exec(`git clone ${transUrl} ${transRepoName}`);
  logger.debug('Finished cloning.');
  shell.cd(transRepoName);
  shell.exec(`git remote add ${repository} ${originalUrl}`);
}
// Set our username and email
shell.exec(`git config user.name "${process.env.USER_NAME}"`);
shell.exec(`git config user.email "${process.env.USER_EMAIL}"`);

shell.exec(`git remote add ${repository} ${originalUrl}`);

// Pull from our own origin
shell.exec(`git checkout ${defaultBranch}`);
shell.exec(`git pull origin ${defaultBranch}`);

// Check out a new branch
shell.exec(`git fetch ${repository} ${defaultBranch}`);
const hash = shell.exec(`git rev-parse ${repository}/${defaultBranch}`).stdout;
const shortHash = hash.substr(0, 8);

const syncBranch = `sync-${shortHash}`;

if (shell.exec(`git checkout ${syncBranch}`).code !== 0) {
  shell.exec(`git checkout -b ${syncBranch}`);
}

// Pull from {source}/master
const output = shell.exec(`git pull ${repository} ${defaultBranch}`).stdout;
if (output.includes('Already up to date.')) {
  logger.info(`We are already up to date with ${repository}.`);
  // Delete repository if cleanup
  if (program.delete) {
    logger.info('Cleaning up repo...');
    shell.cd('..');
    shell.rm('-rf', transRepoName);
  }

  process.exit(0);
}
const lines = output.split('\n');

// Commit all merge conflicts
const conflictLines = lines.filter(line => line.startsWith('CONFLICT'));
const conflictFiles = conflictLines.map(line =>
  line.substr(line.lastIndexOf(' ') + 1),
);

logger.info('conflict files: ', conflictFiles.join('\n'));
shell.exec(`git commit -am "merging all conflicts"`);

// Create a new pull request, listing all conflicting files
shell.exec(`git push --set-upstream origin ${syncBranch}`);

const title = `Sync with ${repository} @ ${shortHash}`;

const conflictsText = `
The following files have conflicts and may need new translations:

  ${conflictFiles.map(file => ` * [ ] ${file}`).join('\n')}
`;

const body = `
This PR was automatically generated.

Merge changes from [reactjs.org](https://github.com/reactjs/reactjs.org/commits/master) at ${shortHash}

${conflictFiles.length > 0 ? conflictsText : 'No conflicts were found.'}

## DO NOT SQUASH MERGE THIS PULL REQUEST!

Doing so will "erase" the commits from master and cause them to show up as conflicts the next time we merge.
`;

const token = process.env.GITHUB_ACCESS_TOKEN;
const octokit = new Octokit({
  auth: `token ${token}`,
  previews: ['hellcat-preview'],
});

octokit.pullRequests.create({
  owner,
  repo: transRepoName,
  title,
  body,
  head: syncBranch,
  base: defaultBranch,
});

// Delete repository if cleanup
if (program.delete) {
  logger.info('Cleaning up repo...');
  shell.cd('..');
  shell.rm('-rf', transRepoName);
}
