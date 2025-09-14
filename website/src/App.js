import styles from './App.module.css'
import ExtLink from './ExtLink'
import LangList from './LangList'
import langs from './langs.json'

function Title() {
  return (
    <h1 className={styles.title}>
      <span role="img" aria-label="globe">
        🌏
      </span>{' '}
      Is React Translated Yet?
    </h1>
  )
}

function Description() {
  return (
    <p className={styles.description}>
      The global React community is translating{' '}
      <ExtLink href="https://react.dev">react.dev</ExtLink> into{' '}
      <strong className={styles.strongText}>{langs.length}</strong> languages:
    </p>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Don&apos;t see your language?</p>
      <p>
        If you are interested in maintaining a translation, follow the
        instructions at{' '}
        <ExtLink href="https://github.com/reactjs/translations.react.dev">
          translations.react.dev
        </ExtLink>
        .
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <div className={styles.app}>
      <Title />
      <Description />
      <LangList langs={langs} />
      <Footer />
    </div>
  )
}
