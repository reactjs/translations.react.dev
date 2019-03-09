import React from 'react'
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

function Header({ name, enName, code, isLink }) {
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
        {name}
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

function getMilestone(amount) {
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
  return { emoji: '🎉', text: 'Released!' }
}

function Progress({ coreCompletion, otherCompletion }) {
  const style = css({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 'auto',
    marginBottom: 'auto',
  })
  const { emoji, text } = getMilestone(coreCompletion)
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
  number,
  coreCompletion,
  otherCompletion,
}) {
  const repoName = `${code}.reactjs.org`
  const baseUrl = `https://github.com/reactjs/${repoName}`
  const issueUrl = `${baseUrl}/issues/${number}`

  // TODO how to combine glamor styles?
  const style = {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem',
    width: '20rem',
    height: '16rem',
    padding: '1rem',
    color: 'black',
    border: '1px gray solid',
    textDecoration: 'none',

    ':hover': {
      outline: '2px gray solid',
    },
  }

  return (
    <ExtLink style={style} href={baseUrl}>
      <Header
        name={name}
        enName={enName}
        code={code}
        isLink={coreCompletion > 0.75}
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
        <p>
          <ExtLink href={issueUrl}>Track progress</ExtLink>
        </p>
        <p {...css({ color: 'DimGrey' })}>
          Start date: {formatDate(createdAt)}
        </p>
      </footer>
      <ProgressBar value={coreCompletion} />
    </ExtLink>
  )
}
