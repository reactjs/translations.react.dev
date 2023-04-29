/**
 *
 * Manual usage: yarn create-translation --lang=some-language-code --maintainers=gaearon,sophiebits
 *
 * NOTE: Unlike sync-translations.js, this script is meant to execute with your
 * own local credentials. We don't want to give org admin access to the bot.
 *
 * You need to be logged into:
 *  - vercel (`npx vercel login`)
 *  - gh (`gh auth login`)
 */
const fs = require('fs');
const yaml = require('js-yaml');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { Octokit } = require('@octokit/rest');
const { remove } = require("fs-extra");
const commander = require("commander");
const allLanguages = require("../langs/langs.json");

commander
  .option('--lang <languageCode>', 'Language code')
  .option('--maintainers <maintainers>', 'Maintainers list (comma-separated)')
  .parse(process.argv);

if (!commander.lang || !commander.maintainers) {
  throw Error('Both --lang and --maintainers arguments are required.');
}

const GITHUB_ORG = "reactjs";
const MAIN_REPOSITORY_NAME = "react.dev";
const botUsername = 'react-translations-bot'; // Given permissions on new repos.

function getGithubConfig() {
  const configPath = path.join(os.homedir(), '.config/gh/hosts.yml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(configFile);
  return config['github.com'];
}

let ghConfig;
try {
  ghConfig = getGithubConfig();
} catch (e) {
  // NOTE: this script always uses the `gh` CLI.
  // We intentionally do NOT try to log in with the bot's token
  // because the bot should not have the rights to admin the entire org.
  // So this script needs to be run by someone who has admin rights.
  throw Error(
    'Could not read GH token from `gh`.\n' +
    'Make sure you installed `gh` and ran `gh auth login` first.'
  );
}
const octokit = new Octokit({ auth: ghConfig.oauth_token });

const languageCode = commander.lang.trim();
const maintainers = commander.maintainers.split(',').map(login => {
  if (login.startsWith('@')) {
    return login.slice(1);
  } else {
    return login;
  }
});
if (maintainers.length === 0) {
  throw Error('At least one maintainer must be specified.');
}

const languageInfo = allLanguages.find(l => l.code === languageCode);
if (!languageInfo) {
  throw Error(
    'Could not find language "' + languageCode + '" in langs/langs.json. ' +
    'Merge the pull request before running this script.'
  );
}

async function execWithOutput(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

async function main() {
  // Let's verify you're logged in.
  await execWithOutput('gh', ['auth', 'status']);
  await execWithOutput('./node_modules/.bin/vercel', ['whoami']);

  // We're going to clone the original repo first, but push it to the new remote.
  console.log('\nCloning the original repo...');
  const newRepoName = `${languageCode}.${MAIN_REPOSITORY_NAME}`;
  const folderName = '.temp/' + newRepoName.replaceAll('.', '-');
  await remove(folderName);
  await execWithOutput('git', ['clone', `https://github.com/${GITHUB_ORG}/${MAIN_REPOSITORY_NAME}`, folderName]);

  // Create the new repo, make it an origin, and push to it.
  console.log('\nCreating GitHub repo:' + newRepoName + '...');
  await octokit.repos.createInOrg({
    org: GITHUB_ORG,
    name: newRepoName,
    description: `(Work in progress) React documentation website in ${languageInfo.enName}`,
    allow_squash_merge: false,
    allow_merge_commit: true,
    allow_rebase_merge: false,
    delete_branch_on_merge: true,
  });
  await octokit.repos.addCollaborator({
    owner: GITHUB_ORG,
    repo: newRepoName,
    username: botUsername,
    permission: 'push', // To create sync branches
  });
  for (const maintainer of maintainers) {
    await octokit.repos.addCollaborator({
      owner: GITHUB_ORG,
      repo: newRepoName,
      username: maintainer,
      permission: 'admin',
    });
  }
  console.log('\nPushing to the new repository...');
  const newRemote = `https://github.com/${GITHUB_ORG}/${newRepoName}.git`;
  const newRemoteWithLoginToken = `${ghConfig.git_protocol}://${ghConfig.user}:${ghConfig.oauth_token}@github.com/${GITHUB_ORG}/${newRepoName}.git`;
  await execWithOutput('git', ['push', newRemoteWithLoginToken], { cwd: folderName });
  await execWithOutput('git', ['remote', 'set-url', 'origin', newRemote], { cwd: folderName });
  // Now let's set up a Vercel project, link it, and trigger the build.
  console.log('\nCreating a Vercel project...');
  await execWithOutput('npx', ['vercel', 'link', '--scope=fbopensource', '--yes'], { cwd: folderName });
  console.log('\nConnecting the Vercel project to GitHub...');
  await execWithOutput('npx', ['vercel', 'git', 'connect', '--yes'], { cwd: folderName });

  // Edit README.md and push to kick off the build
  const readmePath = `${folderName}/README.md`;
  const originalReadmeContent = fs.readFileSync(readmePath, 'utf8');
  const updatedReadmeContent = originalReadmeContent.replaceAll('react.dev', `${languageCode}.react.dev`);
  fs.writeFileSync(readmePath, updatedReadmeContent, 'utf8');
  await execWithOutput('git', ['commit', '-am', 'Set up the translation'], { cwd: folderName });
  await execWithOutput('git', ['push', newRemoteWithLoginToken], { cwd: folderName });
  await remove(folderName);

  console.log('\nCreating an issue to track translation progress...');
  // Create the progress-tracking issue from the template
  const issueTemplate = fs.readFileSync(__dirname + '/../PROGRESS.template.md', 'utf8');
  const issueBody = issueTemplate.replaceAll(
    '{MAINTAINERS}',
    maintainers.map(login => ' - @' + login).join('\n')
  );
  await octokit.issues.create({
    owner: GITHUB_ORG,
    repo: newRepoName,
    title: `${languageInfo.enName} Translation Progress`,
    body: issueBody,
  });
  console.log('\nCreated issue to track translation progress.');
  console.log('\nWe are done here.')
}

main();
