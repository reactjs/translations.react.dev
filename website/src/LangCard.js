import React, { useEffect, useState } from 'react'
import { css } from 'glamor'
import tinycolor from 'tinycolor2'
import Octokit from '@octokit/rest'
import ExtLink from './ExtLink'

function Percentage({ value, size }) {
  const style = css({
    fontSize: size === 'lg' ? '2rem' : '1.5rem',
  })
  return (
    <span {...style}>
      {value !== undefined ? Math.floor(value * 100) : '??'}%
    </span>
  )
}

function Header({ name, enName, code }) {
  return (
    <header>
      <p {...css({ fontSize: '1rem' })}>{enName}</p>
      <h2 {...css({ fontWeight: 'initial', fontSize: '1.5rem' })}>{name}</h2>
      <p {...css({ color: 'dimgrey' })}>({code}.reactjs.org)</p>
    </header>
  )
}

function Progress({ sections, corePages, nextSteps }) {
  const style = css({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 'auto',
    marginBottom: 'auto',
  })
  return (
    <div {...style}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p style={{ fontSize: '3rem' }}>🏗</p>
        <p style={{ fontSize: '1rem', color: 'dimgrey' }}>In progress</p>
      </div>
      <div style={{ width: '8rem', fontSize: '1rem' }}>
        <p>
          Core: <Percentage size="lg" value={sections[corePages]} />
        </p>
        <p>
          Other: <Percentage size="md" value={sections[nextSteps]} />
        </p>
      </div>
    </div>
  )
}

function getColor(amount) {
  if (amount === undefined) {
    return 'white'
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

export default function LangCard({
  name,
  enName,
  code,
  issueNo = 1,
  corePages = 'Core Pages',
  nextSteps = 'Next Steps',
}) {
  const octokit = new Octokit()
  const [sections, setSections] = useState({})
  const baseUrl = `https://github.com/reactjs/${code}.reactjs.org`
  const issueUrl = `${baseUrl}/issues/${issueNo}`

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

  const backgroundColor = getColor(sections[corePages])

  // TODO how to combine glamor styles?
  const style = {
    backgroundColor,
    transition: 'background-color 0.35s',
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '20rem',
    height: '16rem',
    padding: '1rem',
    color: 'black',
    outline: '1px gray solid',
    textDecoration: 'none',

    ':hover': {
      outline: '2px gray solid',
    },
  }

  return (
    <ExtLink style={style} href={baseUrl}>
      <Header name={name} enName={enName} code={code} />
      <Progress
        sections={sections}
        corePages={corePages}
        nextSteps={nextSteps}
      />
      <footer style={{ marginTop: 'auto', lineHeight: 1.25 }}>
        <p>
          <ExtLink href={issueUrl}>Track progress</ExtLink>
        </p>
      </footer>
    </ExtLink>
  )
}
