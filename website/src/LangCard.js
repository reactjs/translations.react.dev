import React, { useRef } from 'react'
import { css } from 'glamor'
import ExtLink from './ExtLink'
import ProgressBar from './ProgressBar'

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

function Header({ name, enName, code, repoUrl, isLink, linkRef }) {
  const linkStyle = css({
    color: 'black',
    textDecoration: 'none',
  })
  return (
    <header>
      <p {...css({ fontSize: '1rem' })}>{enName}</p>
      <h2
        {...css({
          fontWeight: 'initial',
          maxHeight: '2rem',
          fontSize: '1.5rem',
        })}
      >
        <ExtLink {...linkStyle} ref={linkRef} href={repoUrl}>
          {name}
        </ExtLink>
      </h2>
      {isLink ? (
        <ExtLink href={`https://${code}.reactjs.org`}>
          {code}.reactjs.org
        </ExtLink>
      ) : (
        <p {...css({ color: 'dimgray' })}>({code}.reactjs.org)</p>
      )}
    </header>
  )
}

function getMilestone(amount, otherAmount) {
  if (amount === undefined) {
    return { emoji: '❓', text: '???' }
  }
  if (amount < 0.1) {
    return { emoji: '🌱', text: 'Just started' }
  }
  if (amount < 0.75) {
    return { emoji: '🏗', text: 'In progress' }
  }
  if (amount < 1) {
    return { emoji: '🎁', text: 'Wrapping up' }
  }
  if (amount === 1 && otherAmount < 1) {
    return { emoji: '🎉', text: 'Released!' }
  }
  return { emoji: '⭐️', text: 'Complete!' }
}

function Progress({ coreCompletion, otherCompletion }) {
  const style = css({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 'auto',
    marginBottom: 'auto',
  })
  const { emoji, text } = getMilestone(coreCompletion, otherCompletion)
  return (
    <div {...style}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p style={{ fontSize: '2.5rem' }}>{emoji}</p>
        <p style={{ fontSize: '1rem', color: 'dimgrey' }}>{text}</p>
      </div>
      <div style={{ width: '8rem', fontSize: '1rem' }}>
        <p>
          Core: <Percentage size="lg" value={coreCompletion} />
        </p>
        <p>
          Other: <Percentage size="md" value={otherCompletion} />
        </p>
      </div>
    </div>
  )
}

function fNum(num) {
  if (num < 10) return `0${num}`
  return `${num}`
}

function formatDate(dateString) {
  if (!dateString) {
    return '??-??-????'
  }
  const date = new Date(dateString)
  return `${date.getFullYear()}-${fNum(date.getMonth() + 1)}-${fNum(
    date.getDate(),
  )}`
}

export default function LangCard({
  name = '??????',
  enName = '??????',
  code = '??',
  createdAt,
  lastEditedAt,
  number,
  coreCompletion,
  otherCompletion,
}) {
  const linkRef = useRef(null)
  const down = useRef(0)
  const repoName = `${code}.reactjs.org`
  const baseUrl = `https://github.com/reactjs/${repoName}`
  const issueUrl = `${baseUrl}/issues/${number}`

  // Allow clicking on card component accessibly
  // Source: https://inclusive-components.design/cards/
  const handleMouseDown = () => {
    down.current = +new Date()
  }

  const handleMouseUp = () => {
    const up = +new Date()
    if (up - down.current < 200) {
      linkRef.current.click()
    }
  }

  // TODO how to combine glamor styles?
  const style = {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '20rem',
    height: '18rem',
    padding: '1rem',
    border: '1px gray solid',
    cursor: 'pointer',

    ':hover': {
      outline: '2px gray solid',
    },
  }

  return (
    <div style={style} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <Header
        name={name}
        enName={enName}
        code={code}
        repoUrl={baseUrl}
        isLink={coreCompletion > 0.75}
        linkRef={linkRef}
      />
      <Progress
        coreCompletion={coreCompletion}
        otherCompletion={otherCompletion}
      />
      <footer
        {...css({
          marginTop: 'auto',
          lineHeight: 1.25,
          marginBottom: '.5rem',
        })}
      >
        <p {...css({ marginBottom: '.5rem' })}>
          <ExtLink href={issueUrl}>Track progress</ExtLink>
        </p>
        <p {...css({ color: 'DimGrey', fontSize: '.875rem' })}>
          Start date: {formatDate(createdAt)}
        </p>
        <p {...css({ color: 'DimGrey', fontSize: '.875rem' })}>
          Last updated: {formatDate(lastEditedAt)}
        </p>
      </footer>
      <ProgressBar value={coreCompletion} />
    </div>
  )
}
