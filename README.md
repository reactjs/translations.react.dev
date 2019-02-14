# reactjs.org Translation

This repo contains resources and scripts to enable translations of https://reactjs.org.

## Contributing to translations

Check www.isreacttranslatedyet.com to see if your language already has a translation effort in progress. Click on "Track Progress" on the language you want to contribute to in order to receive further instructions.

## Starting a new translation

If you would like to be the maintainer of a new translation, submit a PR adding a new file `{lang-code}.json`
to the `langs` folder with the following information:

* Language name (in English please)
* [Language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
* List of maintainers

For example:

```json
{
  "name": "English",
  "code": "en",
  "maintainers": ["gaearon", "tesseralis"]
}
```

In the PR comment, please describe your experiences with translation (e.g. links to previous work). We prefer more than one maintainer on each repo, so if you're by yourself, we'll leave the PR open for others to join in. If you are a group, please have at least one person other than the PR opener comment, to make sure all people listed actually want to be part of the translation!

Also, please read the [Maintainer Responsibilities](/maintainer-guide.md#maintainer-responsibilities) and make sure that you are comfortable with the responsibilities listed.

Once the PR is accepted, the bot will:

* Create a new repository for you at `reactjs/{lang-code}.reactjs.org`
* Add/invite all maintainers listed to a "reactjs.org {language} Translation" team in the reactjs organization
* Create an issue from [PROGRESS.template.md](/PROGRESS.template.md) in the new repository to track your translation progress

If you are not a member of the reactjs organization, you should receive an email invite to join. Please accept this invite so you can get admin access to your repository!

You may want to [pin](https://help.github.com/articles/pinning-an-issue-to-your-repository/) the generated issue to make it easier to find.

See [Maintainer Tips](/maintainer-guide.md/#tips) for additional advice on how to manage your repository.

Happy translating!

## Adding a maintainer

If you are interested in being a maintainer of a language, or if you're currently a maintainer and want to add another member, send a pull request to this repo updating `langs/{lang-code}.json`, where `{lang-code}` is the language code of the repo you want to be a maintainer of. Then, get one of the current maintainers to approve your pull request and an admin (@tesseralis) will run a script to add you to the maintainer list!

## Before publishing

1. Review your translations and make sure that the pages listed in "Core Pages" are fully translated. Run the site yourself locally to make sure there are no bugs or missing translations.
2. ask {TBD} to add {lang-code}.reactjs.org as a subdomain.
3. submit a PR to [reactjs/reactjs.org](https://github.com/reactjs/reactjs.org) adding the language in the dropdown (once we make it).
4. Celebrate! 🎉🌐

## Acknowledgements

This repo, and the bot that makes all this possible, is based off of and iterated upon [che-tsumi](https://github.com/vuejs-jp/che-tsumi/tree/master/lib) by the [Vue.js Japan User Group](https://github.com/vuejs-jp).
