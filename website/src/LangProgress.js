import React, { useEffect, useState } from 'react'
import Octokit from '@octokit/rest'
import ExtLink from './ExtLink'

function Percentage({ value, size }) {
  const style = {
    fontSize: size === 'lg' ? '1.5rem' : '1.25rem',
  }
  return (
    <span style={style}>
      {value !== undefined ? Math.floor(value * 100) : '??'}%
    </span>
  )
}

function Status({ text }) {
  const style = {
    width: '100%',
    textAlign: 'center',
    fontSize: '2.25rem',
  }
  return <p style={style}>{text}</p>
}

export default function LangProgress({
  name,
  code,
  issueNo = 1,
  yes = 'yes',
  no = 'no',
}) {
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
    color: 'black',

    ':hover': {
      textDecoration: 'none',
      outline: '2px gray solid',
    },
  }
  // TODO add case for "yes" (the URL is available)
  const urlValid = false
  const status = sections['Core Pages'] === 1 && urlValid ? yes : no

  return (
    <ExtLink style={style} href={issue}>
      <header style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ marginBottom: '0.25rem', fontWeight: 'initial' }}>
          {name}
        </h2>
        <p style={{ color: 'gray' }}>({code}.reactjs.org)</p>
      </header>
      <Status text={status} />
      <div style={{ marginTop: 'auto' }}>
        <p>Translation progress</p>
        <p>
          Core: <Percentage size="lg" value={sections['Core Pages']} /> Other:{' '}
          <Percentage size="md" value={sections['Next Steps']} />
        </p>
      </div>
    </ExtLink>
  )
}
