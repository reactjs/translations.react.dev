/**
 * Script to update maintainers
 */
const Octokit = require('@octokit/rest');
const log4js = require('log4js');
const {getJSON} = require('../util');

const [srcConfigFile, langConfigFile] = process.argv.slice(2);
if (!srcConfigFile) {
  throw new Error('Source config file not provided');
}
if (!langConfigFile) {
  throw new Error('Language config file not provided');
}

const token = process.env.GITHUB_ADMIN_ACCESS_TOKEN;
const octokit = new Octokit({
  auth: `token ${token}`,
  previews: ['hellcat-preview'],
});

const {owner} = getJSON(srcConfigFile);
const {name: langName, code: langCode, maintainers: jsonMaintainers} = getJSON(
  langConfigFile,
);

const logger = log4js.getLogger(langCode);
logger.level = 'info';

const teamName = `reactjs.org ${langName} translation`;

async function getTeamId() {
  const {data: allTeams} = await octokit.teams.list({
    org: owner,
    per_page: 100,
  });
  return await allTeams.find(team => team.name === teamName).id;
}

async function getCurrentMaintainers(team_id) {
  const {data: members} = await octokit.teams.listMembers({team_id});
  return members.map(member => member.login);
}

async function getPendingInvites(team_id) {
  const {data: invitees} = await octokit.teams.listPendingInvitations({
    team_id,
  });
  return invitees.map(user => user.login);
}

async function updateMembers(team_id, current, toAdd, role) {
  await Promise.all(
    toAdd.map(async username => {
      if (!current.includes(username)) {
        logger.info(`Inviting ${username} to the ${owner} org`);
        await octokit.teams.addOrUpdateMembership({
          team_id,
          username,
          role,
        });
      }
    }),
  );
}

function logMissing(current, toAdd) {
  current.forEach(member => {
    if (!toAdd.includes(member)) {
      logger.warn(`${member} is in the GitHub team but missing from JSON`);
    }
  });
}

async function update() {
  const team_id = await getTeamId();
  const [maintainers, invitees] = await Promise.all([
    getCurrentMaintainers(team_id),
    getPendingInvites(team_id),
  ]);
  if (invitees.length > 0) {
    logger.info(`Pending invitations: ${invitees.join(', ')}`);
  }
  const maybeMembers = maintainers.concat(invitees);
  logMissing(maintainers.concat(maybeMembers), jsonMaintainers);
  await updateMembers(team_id, maybeMembers, jsonMaintainers, 'maintainer');
}

update();
