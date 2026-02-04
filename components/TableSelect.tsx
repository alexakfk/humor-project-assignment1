'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type TableSelectProps = {
  tables: readonly string[]
  currentTable: string
}

export default function TableSelect({ tables, currentTable }: TableSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('table', value)
    router.push(`/assignment-2?${params.toString()}`)
  }

  return (
    <div className="table-select-wrap">
      <label htmlFor="table-select" className="table-select-label">
        Choose a list:
      </label>
      <select
        id="table-select"
        value={currentTable}
        onChange={(e) => handleChange(e.target.value)}
        className="table-select"
      >
        {tables.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
