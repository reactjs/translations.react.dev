import React, { useEffect, useState } from 'react'
import { css } from 'glamor'
import graphql from '@octokit/graphql'
import LangProgress from './LangCard'

function fromEntries(entries) {
  const obj = {}
  entries.forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

function getLangProgress(lang, issue) {
  const {
    corePages = 'Core Pages',
    nextSteps = 'Next Steps',
    ...langProps
  } = lang
  const { body, ...issueProps } = issue
  const sections = {}
  body.split(/^##\s+/gm).forEach(section => {
    const [heading, ...content] = section.split('\n')
    const items = content.filter(line => {
      return /\* *\[[ x]\]/.test(line)
    })
    const finishedItems = items.filter(line => /\* \[x\]/.test(line))
    sections[heading.trim()] = finishedItems.length / items.length
  })
  return {
    ...langProps,
    ...issueProps,
    coreCompletion: sections[corePages],
    otherCompletion: sections[nextSteps],
  }
}

async function getProgressList(langs) {
  // TODO this search requires looking for issues with the string "Translation Progress"
  // in the title. Maybe we should replace it with something more robust.
  const { search } = await graphql(
    `
      {
        search(
          type: ISSUE
          query: "org:reactjs Translation Progress in:title"
          first: 60
        ) {
          nodes {
            ... on Issue {
              title
              body
              createdAt
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
    },
  )
  const issuesMap = fromEntries(
    search.nodes.map(issue => [issue.repository.name, issue]),
  )

  return langs.map(lang =>
    getLangProgress(lang, issuesMap[`${lang.code}.reactjs.org`]),
  )
}

export default function LangList({ langs }) {
  const [progressList, setProgressList] = useState([{}, {}, {}, {}, {}, {}])
  useEffect(() => {
    getProgressList(langs).then(setProgressList)
  })
  const style = css({
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  })
  return (
    <div {...style}>
      {progressList.map(lang => (
        <LangProgress key={lang.code} {...lang} />
      ))}
    </div>
  )
}
