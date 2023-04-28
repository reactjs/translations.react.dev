# Translation Scripts

## Content Sync

This script syncs changes from the main [reactjs/react.dev](https://github.com/reactjs/react.dev) repo to various translation forks. Configuration for the translation forks is located in the `langs` folder of this repository.

Sync scripts are run weekly via GitHub Actions. Pull requests are created by the shared [@react-translations-bot](https://github.com/react-translations-bot) account. This bot should be granted *write* permissions to all new language forks.

To run the sync script locally, first copy the `.env.sample` to `.env` and fill in all environment variables.

Then to sync all languages, run:
```sh
yarn sync-forks
```

To sync only specific languages, run:
```sh
yarn sync-forks --langs=foo,bar
```

By default, the sync runs from `.github/workflow` and syncs languages in batches.
