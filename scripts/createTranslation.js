/**
 * Create a new language translation of the original repo for the given language code
 * given the configuration in languages.json
 *
 * ```
 * node scripts/createTranslation en
 * ```
 */
const fs = require('fs');
const shell = require('shelljs');
const Octokit = require('@octokit/rest');

const {owner, repository, teamSlug} = require('../config.json');
const languages = require('../languages.json');

shell.config.silent = true;

const originalUrl = `https://github.com/${owner}/${repository}.git`;

const [langCode] = process.argv.slice(2);

const {name: langName, maintainers} = languages.find(
  lang => lang.code === langCode,
);
const newRepoName = `${langCode}.${repository}`;
const newRepoUrl = `https://github.com/${owner}/${newRepoName}.git`;
const defaultBranch = 'master';

const token = process.env.GITHUB_ACCESS_TOKEN;
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
  const body = fs.readFileSync('./PROGRESS.template.md', 'utf8');
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
  shell.cd(this.path);
  shell.exec(`git clone ${originalUrl} ${newRepoName}`);
  shell.cd(newRepoName);
  // Set the remote to the newly created repo
  shell.exec(`git remote set-url origin ${newRepoUrl}`);
  shell.exec(`git push -u origin ${defaultBranch}`);
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
