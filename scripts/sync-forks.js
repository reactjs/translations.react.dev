/**
 *
 * Manual usage: yarn sync-forks --langs=es,zh-hans
 * This script is usually called by .github/workflows/*.
 *
 */
const chalk = require("chalk");
const { exec } = require("child-process-promise");
const { readdirSync } = require("fs");
const { ensureDir, pathExists, readJsonSync } = require("fs-extra");
const { Octokit } = require("@octokit/rest");
const { basename, dirname, join } = require("path");
const createLogger = require("progress-estimator");
const allLanguages = require("../langs/langs.json");

// Load local ENV config (for dev).
// Otherwise this info will come from GitHub secrets.
require("dotenv").config();

const TEMP_DIRECTORY = join(__dirname, ".temp");

const IS_GITHUB_ACTION = process.env.GITHUB_ACTIONS;

const GITHUB_ORG = "reactjs";
const MAIN_REPOSITORY_NAME = "react.dev";
const TRANSLATION_REPOSITORY_NAME = "translations.react.dev";
const DEFAULT_BRANCH = "main";
const FORKS_DIRECTORY_NAME = "forks";

const GITHUB_USER_NAME = process.env.USER_NAME;
const GITHUB_USER_EMAIL = process.env.USER_EMAIL;
const GITHUB_ACCESS_TOKEN = process.env.ACCESS_TOKEN;

console.log(
  "Environmental config found:" +
    `\n  ${chalk.dim("user")}: ${GITHUB_USER_NAME}` +
    `\n  ${chalk.dim("email")}: ${GITHUB_USER_EMAIL}` +
    `\n  ${chalk.dim("access token")}: ${GITHUB_ACCESS_TOKEN}`
);

const formatLanguage = chalk.bold.blue;
const formatError = chalk.bold.red;

async function main() {
  console.log(`Creating temporary directory: ${TEMP_DIRECTORY}`);

  await ensureDir(TEMP_DIRECTORY);

  let logger = null;
  if (IS_GITHUB_ACTION) {
    // If this is running on GitHub, just print the message and wait.
    // Otherwise we would fill the Actions log up with console updates.
    logger = function logger(promise, message) {
      console.log(message);

      return promise;
    };
  } else {
    // If this is being run locally, print a pretty running estimate.
    logger = createLogger({
      storagePath: join(TEMP_DIRECTORY, ".progress-estimator"),
    });
  }

  const mainRepoUrl = `https://github.com/${GITHUB_ORG}/${MAIN_REPOSITORY_NAME}`;
  const mainRepoDir = join(TEMP_DIRECTORY, MAIN_REPOSITORY_NAME);

  // First pull the main react.dev repo.
  await logger(
    checkoutOrUpdateRepo(mainRepoUrl, mainRepoDir),
    chalk.bold("Checking out main react.dev repo.") +
      `\n  ${chalk.dim("repository")}: ${chalk.underline.blue(mainRepoUrl)}` +
      `\n  ${chalk.dim("path")}: ${mainRepoDir}` +
      `\n  ${chalk.dim("estimated duration")}:`, // Progress estimation bar here...
    { estimate: 30000 }
  );

  const allLanguageCodes = allLanguages.map(lang => lang.code);
  let languageCodes;
  // Syncing all languages runs into GitHub rate limiting issues that causes several languages to fail:
  //
  //    You have exceeded a secondary rate limit and have been temporarily blocked from content creation.
  //    Please retry your request again later.
  //
  // This flag lets the GitHub Actions be broken into separate chunks which can be run after an interval.
  if (process.env.ACTIONS_BATCH_PATTERN) {
    // Pattern should be in the form of "2:1" which would mean:
    //   2: Split the languages into two chunks
    //   1: Do the first batch (1-based) aka 0..N
    const [numberOfChunks, chunkPosition] =
      process.env.ACTIONS_BATCH_PATTERN.split(":").map(Number);
    const chunkSize = Math.ceil(allLanguageCodes.length / numberOfChunks);
    const startIndex = chunkSize * (chunkPosition - 1);
    const stopIndex = Math.min(allLanguageCodes.length, startIndex + chunkSize);
    languageCodes = allLanguageCodes.slice(startIndex, stopIndex);
  } else {
    languageCodes = allLanguageCodes;
    // Search for language code from args.
    process.argv.forEach((entry) => {
      if (entry.startsWith("--langs=")) {
        languageCodes = entry.substr(8).split(",");
      }
    });
  }

  // Next pull the various language forks.
  // We parallelize this step because Git checkouts are slow.
  const checkoutPromises = [];
  languageCodes.forEach((languageCode) => {
    const repoName = `${languageCode}.${MAIN_REPOSITORY_NAME}`;
    const repoURL = `https://${GITHUB_USER_NAME}:${GITHUB_ACCESS_TOKEN}@github.com/${GITHUB_ORG}/${repoName}.git`;
    const repoPath = join(TEMP_DIRECTORY, FORKS_DIRECTORY_NAME, repoName);
    checkoutPromises.push(checkoutOrUpdateRepo(repoURL, repoPath));
  });

  await logger(
    Promise.allSettled(checkoutPromises),
    chalk.bold("Checking out languages repos.") +
      `\n  ${chalk.dim("languages")}: ${formatLanguage(
        languageCodes.join(", ")
      )}` +
      `\n  ${chalk.dim("estimated duration")}:`, // Progress estimation bar here...
    { estimate: 330000 }
  );

  const failedLanguageCodesSet = new Set();
  const errorMessageToLanguageCodeMap = new Map();

  // Next pull changes from main repo into language forks.
  // We don't parallelize this step because we might exceed GitHub's API rate limit.
  const syncPromises = [];
  for (let languageCode of languageCodes) {
    await logger(
      syncRepoCatchError(
        languageCode,
        failedLanguageCodesSet,
        errorMessageToLanguageCodeMap
      ),
      chalk.bold(
        `Syncing upstream changes for ${formatLanguage(languageCode)}`
      ) + `\n  ${chalk.dim("estimated duration")}:`, // Progress estimation bar here...
      { estimate: 10000 }
    );
  }

  const successfulLanguageCodes = languageCodes.filter(
    (languageCode) => !failedLanguageCodesSet.has(languageCode)
  );

  if (successfulLanguageCodes.length > 0) {
    console.log(
      `The following languages have successfully synced: ${formatLanguage(
        successfulLanguageCodes.join(", ")
      )}`
    );
  }

  if (errorMessageToLanguageCodeMap.size > 0) {
    errorMessageToLanguageCodeMap.forEach((languageCodes, errorMessage) => {
      console.error(
        `The following languages failed with the error below: ${formatLanguage(
          languageCodes.join(", ")
        )}:\n${formatError(errorMessage)}\n\n`
      );
    });
    process.exit(1);
  }
}

async function checkoutOrUpdateRepo(repoUrl, languagePath) {
  const parentPath = join(languagePath, "..");
  await ensureDir(parentPath);

  const languagePathExists = await pathExists(languagePath);
  if (!languagePathExists) {
    await exec(`git clone ${repoUrl}`, { cwd: parentPath });
  } else {
    const options = { cwd: languagePath };

    // Clean up any conflicts left over from a previous sync.
    try {
      await exec("git reset --hard", options);
    } catch (error) {}

    await exec("git clean -dfx", options);

    const mainBranch = await execRead(
      `git remote show origin | sed -n '/HEAD branch/s/.*: //p'`,
      options
    );

    await exec("git fetch", options);
    await exec(`git reset --hard origin/${mainBranch}`, options);
  }
}

async function createPullRequest({
  body,
  repoName,
  syncBranch,
  title,
}) {
  const octokit = new Octokit({
    auth: GITHUB_ACCESS_TOKEN,
    previews: ["hellcat-preview"],
  });
  await octokit.pulls.create({
    owner: GITHUB_ORG,
    repo: repoName,
    title,
    body,
    head: syncBranch,
    base: DEFAULT_BRANCH,
  });
}

async function execRead(command, options) {
  const { stdout } = await exec(command, options);

  return stdout.trim();
}

async function syncContentWithUpstream(languageCode) {
  const repoName = `${languageCode}.${MAIN_REPOSITORY_NAME}`;
  const repoURL = `https://${GITHUB_USER_NAME}:${GITHUB_ACCESS_TOKEN}@github.com/${GITHUB_ORG}/${repoName}.git`;
  const repoPath = join(TEMP_DIRECTORY, FORKS_DIRECTORY_NAME, repoName);

  const mainRepoUrl = `https://github.com/${GITHUB_ORG}/${MAIN_REPOSITORY_NAME}`;
  const options = { cwd: repoPath };

  await exec(`git config user.name ${GITHUB_USER_NAME}`, options);
  await exec(`git config user.email ${GITHUB_USER_EMAIL}`, options);
  await exec(`git remote set-url origin ${repoURL}`, options);

  try {
    await exec(`git remote add ${GITHUB_ORG} ${mainRepoUrl}`, options);
  } catch (error) {
    // We've already added the branch.
  }

  await exec(`git checkout ${DEFAULT_BRANCH}`, options);
  await exec("git config pull.rebase false", options);
  await exec(`git pull origin ${DEFAULT_BRANCH}`, options);
  await exec(`git fetch ${GITHUB_ORG} ${DEFAULT_BRANCH}`, options);

  const hash = await execRead(
    `git rev-parse ${GITHUB_ORG}/${DEFAULT_BRANCH}`,
    options
  );
  const shortHash = hash.substr(0, 8);
  const syncBranch = `sync-${shortHash}`;

  try {
    await exec(`git branch -D ${syncBranch}`, options);
  } catch (error) {
    // No sync branch existed.
  }

  await exec(`git checkout -b ${syncBranch}`, options);

  try {
    // Try pulling, assuming no conflicts.
    const output = await execRead(
      `git pull ${GITHUB_ORG} ${DEFAULT_BRANCH} --ff-only`,
      options
    );
    if (output.includes("Already up to date.")) {
      console.log('Already up-to-date: ' + languageCode);
      return;
    }

    // If ther are no conflicts, we can merge directly into main
    await exec(`git checkout ${DEFAULT_BRANCH}`, options);
    await exec(`git merge ${syncBranch}`, options);
    await exec(`git push origin ${DEFAULT_BRANCH}`, options);
  } catch (error) {
    // If there are conflicts, we need to pull again and merge them.
    try {
      await execRead(
        `git pull ${GITHUB_ORG} ${DEFAULT_BRANCH} --no-rebase`,
        options
      );
    } catch (error) {
      // Ignore conflicts; we expect them.
    }

    const conflictedFiles = await execRead(
      "git diff --name-only --diff-filter=U",
      options
    );

    if (conflictedFiles !== '') {
      // Commit all merge conflicts
      await exec(`git commit -am "merging all conflicts"`, options);
    }

    // Create a new pull request, listing all conflicting files
    await exec(`git push --set-upstream --force origin ${syncBranch}`, options);

    const title = `Sync with ${MAIN_REPOSITORY_NAME} @ ${shortHash}`;

    let conflictsText = '';
    if (conflictedFiles !== '') {
      conflictsText =
        "The following files have conflicts and may need new translations:\n\n" +
        conflictedFiles
          .split("\n")
          .map(
            (file) =>
              ` * [ ] [${file}](/${GITHUB_ORG}/${MAIN_REPOSITORY_NAME}/commits/main/${file})`
          )
          .join("\n") +
        "\n\nPlease fix the conflicts by pushing new commits to this pull request, either by editing the files directly on GitHub or by checking out this branch.";
    }

    const mainRepoUrl = `https://github.com/${GITHUB_ORG}/${MAIN_REPOSITORY_NAME}`;

    const body =
      "This PR was automatically generated.\n\n" +
      `Merge changes from [react.dev](${mainRepoUrl}/commits/main) at ${shortHash}\n\n` +
      conflictsText +
      `\n\n## DO NOT SQUASH MERGE THIS PULL REQUEST!\n\n` +
      'Doing so will "erase" the commits from main and cause them to show up as conflicts the next time we merge.';

    const repoName = `${languageCode}.${MAIN_REPOSITORY_NAME}`;
    await createPullRequest({
      body,
      repoName,
      syncBranch,
      title,
    });
  }
}

async function syncRepoCatchError(
  languageCode,
  failedLanguageCodesSet,
  errorMessageToLanguageCodeMap
) {
  try {
    await syncContentWithUpstream(languageCode);
  } catch (error) {
    // Save errors for later; don't interrupt parallel scripts.

    failedLanguageCodesSet.add(languageCode);

    const message = error.message;
    if (errorMessageToLanguageCodeMap.has(message)) {
      errorMessageToLanguageCodeMap.get(message).push(languageCode);
    } else {
      errorMessageToLanguageCodeMap.set(message, [languageCode]);
    }
  }
}

main();
