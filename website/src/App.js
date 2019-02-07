import React from 'react'
import './App.css'
import LangProgress from './LangProgress'
import ExtLink from './ExtLink'

const langs = [
  { name: 'Spanish', code: 'es', issueNo: 4 },
  { name: 'Japanese', code: 'ja', issueNo: 4 },
  { name: 'Simplified Chinese', code: 'zh-hans', issueNo: 4 },
]

function Title() {
  const style = {
    fontSize: '2.5rem',
    fontWeight: 'normal',
    marginBottom: '2rem',
  }
  return <h1 style={style}>Is React Translated Yet?</h1>
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
        <LangProgress {...lang} />
      ))}
    </div>
  )
}

export default function App() {
  const style = {
    padding: '2rem',
  }
  return (
    <div style={style}>
      <Title />
      <Description />
      <LangList />
    </div>
  )
}
