import App from '../src/App'
import langs from '../src/langs.json'
import { graphql } from '@octokit/graphql'
import fromPairs from 'lodash/fromPairs'

function getLangProgress(lang, issue) {
  const { body, createdAt, lastEditedAt = createdAt, ...issueProps } = issue
  let coreCompletion = 0
  let otherCompletion = 0
  body.split(/^##\s+/gm).forEach((section) => {
    const [heading, ...content] = section.split('\n')
    const items = content.filter((line) => {
      return /[-*] *\[[ x]\]/.test(line)
    })
    const finishedItems = items.filter((line) => /[-*] \[x\]/.test(line))
    if (/MAIN_CONTENT/.test(heading)) {
      coreCompletion = finishedItems.length / items.length
    } else if (/SECONDARY_CONTENT/.test(heading)) {
      otherCompletion = finishedItems.length / items.length
    }
  })
  return {
    ...lang,
    ...issueProps,
    createdAt,
    lastEditedAt,
    coreCompletion,
    otherCompletion,
  }
}

async function getProgressList(langs) {
  const { search } = await graphql(
    `
      query ($limit: Int!) {
        search(
          type: ISSUE
          query: "org:reactjs Translation Progress in:title is:open"
          first: $limit
        ) {
          nodes {
            ... on Issue {
              title
              body
              createdAt
              lastEditedAt
              number
              repository {
                name
              }
            }
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.REACT_APP_GITHUB_AUTH_TOKEN}`,
      },
      limit: langs.length + 15,
    },
  )

  const issuesMap = fromPairs(
    search.nodes
      .filter((issue) => !!issue && issue.repository)
      .map((issue) => [issue.repository.name.toLowerCase(), issue]),
  )

  return langs
    .map((lang) => {
      const issue = issuesMap[`${lang.code.toLowerCase()}.react.dev`]
      return issue ? getLangProgress(lang, issue) : null
    })
    .filter(Boolean)
}

export default async function HomePage() {
  const progressList = await getProgressList(langs)
  return <App progressList={progressList} />
}
