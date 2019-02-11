import React, { useEffect, useState } from 'react'
import tinycolor from 'tinycolor2'
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

function getColor(amount) {
  if (amount === undefined) {
    return 'whitesmoke'
  }

  if (amount < 0.5) {
    return tinycolor
      .mix(tinycolor('whitesmoke'), tinycolor('lemonchiffon'), amount * 100)
      .toHexString()
  }
  return tinycolor
    .mix(
      tinycolor('lemonchiffon'),
      tinycolor('greenyellow'),
      (amount - 0.5) * 100,
    )
    .toHexString()
}

export default function LangProgress({
  name,
  code,
  issueNo = 1,
  yes = 'yes',
  no = 'no',
  corePages = 'Core Pages',
  nextSteps = 'Next Steps',
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

  // TODO add case for "yes" (the URL is available)
  const urlValid = false
  const status = sections[corePages] === 1 && urlValid ? yes : no
  console.log(code, sections[corePages])
  const backgroundColor = getColor(sections[corePages])

  const style = {
    backgroundColor,
    transition: 'background-color 0.35s',
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '20rem',
    height: '12rem',
    padding: '1rem',
    color: 'black',
    outline: '1px gray solid',

    ':hover': {
      textDecoration: 'none',
      outline: '2px gray solid',
    },
  }
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
          Core: <Percentage size="lg" value={sections[corePages]} /> Other:{' '}
          <Percentage size="md" value={sections[nextSteps]} />
        </p>
      </div>
    </ExtLink>
  )
}
