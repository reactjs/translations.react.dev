const fs = require('fs');
const shell = require('shelljs');
const Octokit = require('@octokit/rest');
// shell.config.silent = true;

const [srcConfigFile, langConfigFile] = process.argv.slice(2);
if (!srcConfigFile) {
  throw new Error('Source config file not provided');
}
if (!langConfigFile) {
  throw new Error('Language config file not provided');
}

function getJSON(file) {
  // Get content from file
  return JSON.parse(fs.readFileSync(file));
}

const {owner, repository} = getJSON(srcConfigFile);
const {code: langCode} = getJSON(langConfigFile);

const originalUrl = `https://github.com/${owner}/${repository}.git`;

const transRepoName = `${langCode}.${repository}`;
const transUrl = `https://github.com/${owner}/${transRepoName}.git`;
const defaultBranch = 'master';

// Set up
shell.cd('repo');
if (shell.cd(transRepoName).code !== 0) {
  console.log(`${transUrl} Can't find translation repo locally. Cloning...`);
  shell.exec(`git clone ${transUrl} ${transRepoName}`);
  console.log(`${transUrl} Finished cloning.`);
  shell.cd(transRepoName);
  shell.exec(`git remote add ${repository} ${originalUrl}`);
}
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
  console.log(`${transRepoName} we are already up to date with ${repository}.`);
  process.exit(0);
}
const lines = output.split('\n');

// Commit all merge conflicts
const conflictLines = lines.filter(line => line.startsWith('CONFLICT'));
const conflictFiles = conflictLines.map(line =>
  line.substr(line.lastIndexOf(' ') + 1),
);

console.log('conflict files: ', conflictFiles.join('\n'));
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

Doing so will "erase" the commits from master and cause them to show
up as conflicts the next time we merge.
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
