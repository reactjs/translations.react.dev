import styles from './ProgressBar.module.css'
import tinycolor from 'tinycolor2'

function getColor(amount) {
  if (amount === undefined) {
    return '#e1e8ed'
  }

  if (amount < 0.5) {
    return tinycolor
      .mix(tinycolor('lightsalmon'), tinycolor('yellow'), amount * 333)
      .toHexString()
  }
  return tinycolor
    .mix(tinycolor('yellow'), tinycolor('lime'), (amount - 0.7) * 333)
    .toHexString()
}

export default function ProgressBar({ value = 0 }) {
  const percent = value * 100
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={styles.progressBar}
    >
      <div
        className={styles.progressFill}
        style={{
          width: `${percent}%`,
          backgroundColor: getColor(value),
        }}
      />
    </div>
  )
}
