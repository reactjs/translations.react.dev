import styles from './SortSelector.module.css'

function SortOption({ value, currentValue, label, onSelect }) {
  const isActive = currentValue === value
  const className = isActive
    ? `${styles.sortOption} ${styles.active}`
    : styles.sortOption
  return (
    <button className={className} onClick={() => onSelect(value)}>
      {label}
    </button>
  )
}

export default function SortSelector({ options, value, onSelect }) {
  return (
    <div className={styles.sortSelector}>
      Sort By:{' '}
      {options.map(({ key, label }) => (
        <SortOption
          key={key}
          value={key}
          label={label}
          currentValue={value}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
