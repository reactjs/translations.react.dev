/**
 * Create a new translation of the original repo in [source config] with the info in [trans config].
 *
 * YOU MUST HAVE ADMIN ACCESS TO THE ORGANIZATION FOR THIS TO WORK.
 * BEHAVIOR IF YOU ARE NOT AN OWNER IS UNDEFINED.
 *
 * ```
 * node scripts/create.js [source config] [trans config]
 * ```
 *
 * Given the following files:
 *
 * `config.json`
 * ```
 * {
 *   "owner": "reactjs",
 *   "repository": "reactjs.org",
 *   "teamSlug": "reactjs-localization"
 * }
 * ```
 *
 * `arr.json`
 * ```
 * {
 *   "name": "Japanese",
 *   "code": "ja",
 *   "maintainers": ["smikitky", "potato4d"]
 * }
 * ```
 *
 * Running this script:
 *
 * ```
 * node scripts/create.js config.json ja.json
 * ```
 *
 * will have the following effects:
 *
 * * Create a new repository reactjs/ja.reactjs.org with the current contents of reactjs.org
 * * Create a new issue in this repo "Japanese Translation Progress" with a list
 *   of pages to translate
 * * Create a team "reactjs.org Japanese Translation" and invite all people listed in `maintainers`
 *   to the reactjs organization and give them access to the repository
 */
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

const {owner, repository, teamSlug} = getJSON(srcConfigFile);
const {code: langCode, name: langName, maintainers} = getJSON(langConfigFile);

const originalUrl = `https://github.com/${owner}/${repository}.git`;

const newRepoName = `${langCode}.${repository}`;
const newRepoUrl = `https://github.com/${owner}/${newRepoName}.git`;
const defaultBranch = 'master';

const token = process.env.GITHUB_ADMIN_ACCESS_TOKEN;
const octokit = new Octokit({
  auth: `token ${token}`,
  previews: ['hellcat-preview'],
});

async function doesRepoExist() {
  const {
    data: {total_count},
  } = await octokit.search.repos({
    q: `${owner}/${newRepoName}`,
  });
  return total_count > 0;
}

async function createProgressIssue() {
  // Create the progress-tracking issue from the template
  const rawBody = fs.readFileSync('./PROGRESS.template.md', 'utf8');
  const maintainerList = maintainers.map(name => `* @${name}`).join('\n');
  const body = rawBody.replace('{MAINTAINERS}\n', maintainerList);
  await octokit.issues.create({
    owner,
    repo: newRepoName,
    title: `${langName} Translation Progress`,
    body,
  });
  console.log(`${newRepoName} Created in issue to track translation progress`);
}

async function addTeamMembers(team_id, members, role) {
  await Promise.all(
    members.map(async username => {
      await octokit.teams.addOrUpdateMembership({
        team_id,
        username,
        role,
      });
    }),
  );
}

async function giveTeamRepoAccess(team_id) {
  await octokit.teams.addOrUpdateRepo({
    team_id,
    owner,
    repo: newRepoName,
    permission: 'admin',
  });
}

async function createTeam() {
  // Find the parent team id
  const {data: allTeams} = await octokit.teams.list({org: owner});
  const parent_team_id = allTeams.find(team => team.slug === teamSlug).id;

  // Make the team...
  const {
    data: {id: team_id},
  } = await octokit.teams.create({
    org: owner,
    name: `${repository} ${langName} translation`,
    description: `Discuss the translation of ${repository} into ${langName}.`,
    privacy: 'closed',
    parent_team_id,
  });

  await Promise.all([
    giveTeamRepoAccess(team_id),
    addTeamMembers(team_id, maintainers, 'maintainer'),
  ]);

  console.log(`${newRepoName} Set up a new team and invited maintainers!`);
}

function pushOriginalContents() {
  console.log(`${newRepoName} Setting up duplicate repo...`);
  shell.cd('repo');
  // If we can't find the repo, clone it
  if (shell.cd(repository).code !== 0) {
    console.log(`${newRepoUrl} Can't find source repo locally. Cloning it...`);
    shell.exec(`git clone ${originalUrl} ${repository}`);
    console.log(`${newRepoUrl} Finished cloning.`);
    shell.cd(repository);
  }
  // Set the remote to the newly created repo
  shell.exec(`git pull origin ${defaultBranch}`);
  shell.exec(`git remote add ${newRepoName} ${newRepoUrl}`);
  shell.exec(`git push -u ${newRepoName} ${defaultBranch}`);
  console.log(`${newRepoName} Finished copying contents`);
}

// TODO it would be nice to do this as part of an automatic process,
// but I'm too scared not to do it manually rn
async function setupRepositoryAndTeam() {
  if (await doesRepoExist()) {
    console.log(`${newRepoUrl} exists already.`);
    return;
  }

  console.log(`${newRepoName} Creating new repo in GitHub...`);
  await octokit.repos.createInOrg({
    org: owner,
    name: newRepoName,
    // TODO generalize this (maybe get from the head repo?)
    description: `(Work in progress) React documentation website in ${langName}`,
  });
  console.log(`${newRepoName} Finished creating repo!`);

  // Create the progress-tracking issue from the template
  await Promise.all([
    createProgressIssue(),
    createTeam(),
    pushOriginalContents(),
  ]);
}

setupRepositoryAndTeam();
