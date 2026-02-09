import { useRef } from 'react'
import styles from './LangCard.module.css'
import ExtLink from './ExtLink'
import ProgressBar from './ProgressBar'

function Percentage({ value, size }) {
  const className = size === 'lg' ? styles.percentageLarge : styles.percentage
  return (
    <span className={className}>
      {value !== undefined ? Math.floor(value * 100) : '??'}%
    </span>
  )
}

function Header({ name, enName, code, repoUrl, isLink, linkRef }) {
  return (
    <header>
      <p className={styles.enName}>{enName}</p>
      <h2 className={styles.langName}>
        <ExtLink className={styles.linkStyle} ref={linkRef} href={repoUrl}>
          {name}
        </ExtLink>
      </h2>
      {isLink ? (
        <ExtLink href={`https://${code}.react.dev`}>{code}.react.dev</ExtLink>
      ) : (
        <p className={styles.repoCode}>({code}.react.dev)</p>
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
  const { emoji, text } = getMilestone(coreCompletion, otherCompletion)
  return (
    <div className={styles.progress}>
      <div className={styles.milestoneContainer}>
        <p className={styles.milestoneEmoji}>{emoji}</p>
        <p className={styles.milestoneText}>{text}</p>
      </div>
      <div className={styles.progressStats}>
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
  const repoName = `${code}.react.dev`
  const baseUrl = `https://github.com/reactjs/${repoName}`
  const issueUrl = `${baseUrl}/issues/${number}`

  // Allow clicking on card component accessibly
  // Source: https://inclusive-components.design/cards/
  const handleMouseDown = () => {
    down.current = +new Date()
  }

  const handleMouseUp = (e) => {
    const up = +new Date()
    if (up - down.current < 200 && e.target.nodeName !== 'A') {
      linkRef.current.click()
    }
  }

  return (
    <div
      className={styles.card}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
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
      <div className={styles.progressBarWrapper}>
        <ProgressBar value={coreCompletion} />
      </div>
      <div className={styles.cardActions}>
        <ExtLink className={styles.contributeButton} href={issueUrl}>
          Contribute
        </ExtLink>
      </div>
      <footer className={styles.footer}>
        <p className={styles.dateText}>Started: {formatDate(createdAt)}</p>
        <p className={styles.dateText}>
          Updated: {formatDate(lastEditedAt)}
        </p>
      </footer>
    </div>
  )
}
