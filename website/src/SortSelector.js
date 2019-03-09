import React from 'react'
import { css } from 'glamor'

const filters = [
  { key: 'code', label: 'Lang Code' },
  { key: 'enName', label: 'English Name' },
  { key: 'coreCompletion', label: 'Completion' },
  { key: 'createdAt', label: 'Start Date' },
]

function SortOption({ value, currentValue, label, onSelect }) {
  const style = css({
    border: 'none',
    background: 'none',
    width: '8rem',
    fontSize: '1rem',
    fontWeight: currentValue === value ? 700 : 500,
    color: currentValue === value ? 'black' : '#333',
  })
  return (
    <button {...style} onClick={() => onSelect(value)}>
      {label}
    </button>
  )
}

export default function SortSelector({ value, onSelect }) {
  const style = css({
    display: 'flex',
    justifyContent: 'center',
    color: '#333',
  })
  return (
    <div {...style}>
      Sort By:{' '}
      {filters.map(({ key, label }) => (
        <SortOption
          value={key}
          label={label}
          currentValue={value}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
