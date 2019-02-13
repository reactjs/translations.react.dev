# Translating reactjs.org

This repo contains resources and scripts to enable translations of https://reactjs.org.

## Contributing to translations

Check www.isreacttranslatedyet.com to see if your language already has a translation effort in progress.

## Starting a New Translation

To start a new translation project, submit a PR adding a new file `{lang-code}.json`
to the `langs` folder with the following information:

* Language name
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

In the PR comment, please describe your experiences with translation (e.g. links to previous work). We would prefer more than one maintainer on each repo.

Once the PR is accepted, the bot will:

* Create a new repository for you at `reactjs/{lang-code}.reactjs.org`
* Add/invite all maintainers listed to a "reactjs.org {language} Translation" team in the reactjs organization
* Create an issue from [this template](./PROGRESS.template.md) in the new repository to track your translation progress

After that, you may want to [pin](https://help.github.com/articles/pinning-an-issue-to-your-repository/) the generated issue to make it easier to find.

Happy translating!

## Before publishing

1. Review your translations and make sure that the pages listed in "minimum viable translation" are fully translated. Run the site yourself locally to make sure there are no bugs or snags.
2. ask {TBD} to add {lang-code}.reactjs.org as a subdomain
3. submit a PR to [reactjs/reactjs.org](https://github.com/reactjs/reactjs.org) adding the language in the dropdown
4. celebrate!

## Acknowledgements

This repo, and the bot that makes all this possible, is based off of and iterated upon [che-tsumi](https://github.com/vuejs-jp/che-tsumi/tree/master/lib) by the [Vue.js Japan User Group](https://github.com/vuejs-jp).
