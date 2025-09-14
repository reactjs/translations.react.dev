import styles from './ProgressBar.module.css'
import tinycolor from 'tinycolor2'

function getColor(amount) {
  const medColor = 'yellow'
  if (amount === undefined) {
    return 'white'
  }

  if (amount < 0.5) {
    return tinycolor
      .mix(tinycolor('lightsalmon'), tinycolor(medColor), amount * 100)
      .toHexString()
  }
  return tinycolor
    .mix(tinycolor(medColor), tinycolor('lime'), (amount - 0.5) * 100)
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
