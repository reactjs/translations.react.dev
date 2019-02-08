import React, { useEffect, useState } from 'react'
import Octokit from '@octokit/rest'
import ExtLink from './ExtLink'

function Percentage({ value, size }) {
  const style = {
    fontSize: size === 'lg' ? '2rem' : '1.5rem',
  }
  return (
    <span style={style}>
      {value !== undefined ? Math.floor(value * 100) : '??'}%
    </span>
  )
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

export default function LangProgress({ name, code, issueNo = 1 }) {
  const octokit = new Octokit()
  const [sections, setSections] = useState({})
  const issue = `https://github.com/reactjs/${code}.reactjs.org/issues/${issueNo}`

  async function getIssues() {
    const issue = await octokit.issues.get({
      owner: 'reactjs',
      repo: `${code}.reactjs.org`,
      number: issueNo,
    })
    const { body } = issue.data
    const _sections = {}
    body.split(/^##\s+/gm).forEach(section => {
      const [heading, ...content] = section.split('\n')
      const items = content.filter(line => {
        return /\* *\[[ x]\]/.test(line)
      })
      const finishedItems = items.filter(line => /\* \[x\]/.test(line))
      _sections[heading.trim()] = finishedItems.length / items.length
    })
    setSections(_sections)
  }
  useEffect(() => {
    getIssues()
  }, [code, issueNo])

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
        <p style={{ color: 'gray' }}>({code}.reactjs.org)</p>
      </header>
      <p style={{ marginTop: 'auto' }}>
        Core: <Percentage size="lg" value={sections['Core Pages']} /> Other:{' '}
        <Percentage size="md" value={sections['Next Steps']} />
      </p>
      <footer style={{ marginTop: '0.25rem' }}>
        <IssueLink href={issue} />
      </footer>
    </div>
  )
}
