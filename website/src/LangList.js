import React, { useEffect, useState, useMemo } from 'react'
import { css } from 'glamor'
import graphql from '@octokit/graphql'
import LangProgress from './LangCard'
import SortSelector from './SortSelector'

function fromEntries(entries) {
  const obj = {}
  entries.forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

function sortBy(array, fn) {
  const duplicate = [...array]
  duplicate.sort((a, b) => (fn(a) > fn(b) ? 1 : fn(a) < fn(b) ? -1 : 0))
  return duplicate
}

function getLangProgress(lang, issue) {
  const {
    corePages = 'Core Pages',
    nextSteps = 'Next Steps',
    ...langProps
  } = lang
  const { body, createdAt, lastEditedAt = createdAt, ...issueProps } = issue
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
    createdAt,
    lastEditedAt,
    coreCompletion: sections[corePages],
    otherCompletion: sections[nextSteps],
  }
}

async function getProgressList(langs) {
  // TODO this search requires looking for issues with the string "Translation Progress"
  // in the title. Maybe we should replace it with something more robust.
  const { search } = await graphql(
    `
      query($limit: Int!) {
        search(
          type: ISSUE
          query: "org:reactjs Translation Progress in:title"
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
      limit: langs.length + 5, // padding in case of extra issues
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
  const [progressList, setProgressList] = useState(langs)
  const [sortKey, setSortKey] = useState('code')
  useEffect(() => {
    getProgressList(langs).then(setProgressList)
  })
  const style = css({
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  })

  const sortedList = useMemo(() => {
    const sorted = sortBy(progressList, item => item[sortKey])
    if (sortKey === 'coreCompletion' || sortKey === 'lastEditedAt') {
      sorted.reverse()
    }
    return sorted
  }, [progressList, sortKey])

  return (
    <div>
      <SortSelector value={sortKey} onSelect={setSortKey} />
      <div {...style}>
        {sortedList.map(lang => (
          <LangProgress key={lang.code} {...lang} />
        ))}
      </div>
    </div>
  )
}
