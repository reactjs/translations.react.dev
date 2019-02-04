import React from 'react'
import logo from './logo.svg'
import './App.css'
import LangProgress from './LangProgress'
import ExtLink from './ExtLink'

const langs = [
  { name: 'Spanish', code: 'es', issueNo: 4 },
  { name: 'Japanese', code: 'ja', issueNo: 4 },
  { name: 'Simplified Chinese', code: 'zh-hans', issueNo: 4 },
]

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Is React Translated Yet?</h1>
        <p>
          Is <ExtLink href="https://reactjs.org">reactjs.org</ExtLink> available
          in:
        </p>
        {langs.map(lang => (
          <LangProgress {...lang} />
        ))}
      </header>
    </div>
  )
}
