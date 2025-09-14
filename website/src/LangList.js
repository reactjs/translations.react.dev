'use client'
import { useState, useMemo } from 'react'
import styles from './LangList.module.css'
import sortBy from 'lodash/sortBy'
import LangProgress from './LangCard'
import SortSelector from './SortSelector'

const sortOptions = [
  { key: 'code', label: 'Lang Code' },
  { key: 'enName', label: 'English Name' },
  { key: ['coreCompletion', 'otherCompletion'], label: 'Completion' },
  { key: 'createdAt', label: 'Start Date' },
  { key: 'lastEditedAt', label: 'Last Updated' },
]

export default function LangList({ progressList }) {
  const [sortKey, setSortKey] = useState('code')

  const sortedList = useMemo(() => {
    const sorted = sortBy(progressList, sortKey)
    if (
      (Array.isArray(sortKey) && sortKey.includes('coreCompletion')) ||
      sortKey === 'lastEditedAt'
    ) {
      sorted.reverse()
    }
    return sorted
  }, [progressList, sortKey])

  return (
    <div>
      <SortSelector
        options={sortOptions}
        value={sortKey}
        onSelect={setSortKey}
      />
      <div className={styles.langGrid}>
        {sortedList.map((lang) => (
          <LangProgress key={lang.code} {...lang} />
        ))}
      </div>
    </div>
  )
}
