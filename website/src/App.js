import React from 'react'
import LangProgress from './LangProgress'
import ExtLink from './ExtLink'
import langs from './langs'

function Title() {
  const style = {
    fontSize: '2.5rem',
    fontWeight: 'normal',
    marginBottom: '2rem',
  }
  return (
    <h1 style={style}>
      <span role="img" aria-label="globe">
        🌏
      </span>{' '}
      Is React Translated Yet?
    </h1>
  )
}

function Description() {
  const style = {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  }

  return (
    <p style={style}>
      Is <ExtLink href="https://reactjs.org">reactjs.org</ExtLink> available in:
    </p>
  )
}

function LangList() {
  const style = {
    display: 'flex',
    flexWrap: 'wrap',
  }
  return (
    <div style={style}>
      {langs.map(lang => (
        <LangProgress key={lang.code} {...lang} />
      ))}
    </div>
  )
}

function Footer() {
  const style = {
    marginTop: '2rem',
    marginBottom: '2rem',
    fontSize: '1.5rem',
  }
  return (
    <footer style={style}>
      <p>
        If you are interested in maintaining a translation, follow the
        instructions{' '}
        <ExtLink href="https://github.com/reactjs/reactjs.org-translation">
          here
        </ExtLink>
        .
      </p>
    </footer>
  )
}

export default function App() {
  const style = {
    padding: '2rem 4rem',
    width: '100vw',
  }
  return (
    <div style={style}>
      <Title />
      <Description />
      <LangList />
      <Footer />
    </div>
  )
}
