import React from 'react'
import LangProgress from './LangProgress'
import ExtLink from './ExtLink'

const langs = [
  { name: 'Arabic', code: 'ar', yes: 'نعم فعلا', no: 'لا' },
  { name: 'Azerbaijani', code: 'az', yes: 'bəli', no: 'yox' },
  { name: 'Bulgarian', code: 'bg', yes: 'да', no: 'не' },
  { name: 'German', code: 'de', yes: 'ja', no: 'nein' },
  { name: 'Spanish', code: 'es', issueNo: 4, yes: 'sí', no: 'no' },
  { name: 'Persian', code: 'fa', yes: 'بله', no: 'نه' },
  {
    name: 'French',
    code: 'fr',
    yes: 'oui',
    no: 'non',
    corePages: 'Pages Fondamentales',
    nextSteps: 'Étapes suivantes',
  },
  { name: 'Hebrew', code: 'he', yes: 'כן', no: 'לא' },
  { name: 'Hindi', code: 'hi', yes: 'हाँ', no: 'नहीं' },
  { name: 'Armenian', code: 'hy', yes: 'Այո', no: 'Ոչ' },
  { name: 'Indonesian', code: 'id', yes: 'iya', no: 'tidak ada' },
  { name: 'Japanese', code: 'ja', issueNo: 4, yes: 'はい', no: 'いいえ' },
  { name: 'Korean', code: 'ko', yes: '예', no: '아니요' },
  { name: 'Malayalam', code: 'ml', yes: 'അതെ', no: 'ഇല്ല' },
  { name: 'Dutch', code: 'nl', yes: 'ja', no: 'nee' },
  { name: 'Polish', code: 'pl', yes: 'tak', no: 'nie' },
  { name: 'Portuguese (Brazil)', code: 'pt-BR', yes: 'sim', no: 'não' },
  { name: 'Russian', code: 'ru', yes: 'да', no: 'нет' },
  { name: 'Tamil', code: 'ta', yes: 'ஆம்', no: 'இல்லை' },
  { name: 'Ukrainian', code: 'uk', yes: 'так', no: 'ні' },
  { name: 'Uzbek', code: 'uz', yes: 'ha', no: "yo'q" },
  { name: 'Vietnamese', code: 'vi', yes: 'Vâng', no: 'Không' },
  {
    name: 'Simplified Chinese',
    code: 'zh-hans',
    issueNo: 4,
    yes: '是',
    no: '没有',
  },
  { name: 'Traditional Chinese', code: 'zh-hant', yes: '是', no: '沒有' },
]

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
