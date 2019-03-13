import React from 'react'
import { css } from 'glamor'

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

export default function SortSelector({ options, value, onSelect }) {
  const style = css({
    display: 'flex',
    justifyContent: 'center',
    color: '#333',
    fontWeight: 500,
  })
  return (
    <div {...style}>
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
