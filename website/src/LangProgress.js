import React, { useEffect, useState } from 'react'
import Octokit from '@octokit/rest'
import ExtLink from './ExtLink'

export default function LangProgress({ name, code, issueNo }) {
  const octokit = new Octokit()
  const [finished, setFinished] = useState()
  const [total, setTotal] = useState()
  const issue = `https://github.com/reactjs/${code}.reactjs.org/issues/${issueNo}`
  useEffect(() => {
    setTimeout(async () => {
      const issue = await octokit.issues.get({
        owner: 'reactjs',
        repo: `${code}.reactjs.org`,
        number: issueNo,
      })
      const { body } = issue.data
      const items = body.split('\n').filter(line => {
        return /\* *\[[ x]\]/.test(line)
      })
      setTotal(items.length)
      const finishedItems = items.filter(line => /\* \[x\]/.test(line))
      setFinished(finishedItems.length)
    }, 0)
  }, [code, issueNo])
  const isFinished =
    total === undefined ? '❓' : finished === total ? '✅' : '🚫'
  return (
    <p>
      <div>
        <ExtLink href={issue}>{name}</ExtLink>: {isFinished}
      </div>
      <div>
        Progress: {finished || '?'}/{total || '?'} pages translated
      </div>
    </p>
  )
}
