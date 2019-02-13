import React from 'react'
import { css } from 'glamor'
import LangProgress from './LangCard'
import ExtLink from './ExtLink'
import langs from './langs'

function Title() {
  const style = css({
    fontSize: '2.5rem',
    fontWeight: 'normal',
    marginBottom: '2rem',
  })
  return (
    <h1 {...style}>
      <span role="img" aria-label="globe">
        🌏
      </span>{' '}
      Is React Translated Yet?
    </h1>
  )
}

function Description() {
  const style = css({
    fontSize: '1.5rem',
    marginBottom: '1rem',
  })

  return (
    <p {...style}>
      The global React community is translating{' '}
      <ExtLink href="https://reactjs.org">reactjs.org</ExtLink> into{' '}
      <strong {...css({ fontWeight: 600 })}>{langs.length}</strong> languages:
    </p>
  )
}

function LangList() {
  const style = css({
    display: 'flex',
    flexWrap: 'wrap',
  })
  return (
    <div {...style}>
      {langs.map(lang => (
        <LangProgress key={lang.code} {...lang} />
      ))}
    </div>
  )
}

function Footer() {
  const style = css({
    marginTop: '2rem',
    marginBottom: '2rem',
    fontSize: '1.5rem',
    lineHeight: 2,
  })
  return (
    <footer {...style}>
      <p>Don't see your language?</p>
      <p>
        If you are interested in maintaining a translation, follow the
        instructions at{' '}
        <ExtLink href="https://github.com/reactjs/reactjs.org-translation">
          reactjs.org-translation
        </ExtLink>
        .
      </p>
      <p>
        We also have a{' '}
        <ExtLink href="https://rt-slack-invite.herokuapp.com">
          Slack channel
        </ExtLink>
        !
      </p>
    </footer>
  )
}

export default function App() {
  const style = css({
    padding: '2rem 4rem',
    width: '100vw',
  })
  return (
    <div {...style}>
      <Title />
      <Description />
      <LangList />
      <Footer />
    </div>
  )
}
