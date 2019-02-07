import React, { useEffect, useState } from 'react'
import Octokit from '@octokit/rest'
import ExtLink from './ExtLink'

function Percentage({ value }) {
  const style = {
    fontSize: '2rem',
  }
  return <span style={style}>{value ? Math.floor(value * 100) : '??'}%</span>
}

function IssueLink({ href }) {
  const style = {
    color: 'blue',
  }
  return (
    <ExtLink href={href} style={style}>
      Track Progress
    </ExtLink>
  )
}

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
  const percentage = total ? finished / total : undefined
  const status = total === undefined ? '❓' : finished === total ? '✅' : '🚫'

  const style = {
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '20rem',
    height: '12rem',
    border: '1px gray solid',
    padding: '1rem',
  }

  return (
    <div style={style}>
      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '0.25rem', fontWeight: 'initial' }}>
          {name}
        </h2>
        <p>
          {code}.reactjs.org {status}
        </p>
      </header>
      <p style={{ marginTop: 'auto' }}>
        <Percentage value={percentage} /> complete
      </p>
      <footer style={{ marginTop: '0.25rem' }}>
        <IssueLink href={issue} />
      </footer>
    </div>
  )
}
