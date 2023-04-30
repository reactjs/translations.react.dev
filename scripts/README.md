# Translation Scripts

## Syncing Translations

This script syncs changes from the main [reactjs/react.dev](https://github.com/reactjs/react.dev) repo to various translation forks. Configuration for the translation forks is located in the `langs` folder of this repository.

Sync scripts are run weekly via GitHub Actions. Pull requests are created by the shared [@react-translations-bot](https://github.com/react-translations-bot) account. This bot is normally granted *write* permissions to all new language forks.

To run the sync script locally, first copy the `.env.sample` to `.env` and fill in all environment variables.

Then to sync all languages, run:
```sh
yarn
yarn sync-forks
```

To sync only specific languages, run:
```sh
yarn
yarn sync-forks --langs=foo,bar
```

By default, the sync runs from `.github/workflow` and syncs languages in batches.

## Creating a Translation

A bot cannot create a translation, only people with org access can. Normally, React team members should monitor this repository, but feel free to raise an issue on the main React repo if a translation attempt is being unattended.

If you're a member of React team, here's what you need to do:

1. Install `gh` (GitHub CLI) and do `gh auth login`
2. Run `npx vercel login` and ensure you have permissions to create projects in Meta Open Source org
3. Ensure you have permissions to create projects in the `reactjs` GitHub org

Review the pull request associated with the translation. It should be adding it to the `langs/langs.json` file. Suppose we're adding the `foo` language code with `@bar` and `@baz` GitHub users as maintainers. Merge the pull request and run in this folder:

```sh
yarn
yarn create-translation --lang=foo --maintainers=bar,baz
```

This should create the GitHub repo, create a Vercel project, link them, and deploy them. This won't by itself set up the domain--that can wait until the translation is mature.
