import { Suspense } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  ALLOWED_TABLES,
  DEFAULT_TABLE,
  isAllowedTable,
} from '@/lib/tables'
import TableSelect from '@/components/TableSelect'

type Assignment2Props = {
  searchParams: Promise<{ table?: string }> | { table?: string }
}

export default async function Assignment2({ searchParams }: Assignment2Props) {
  const params = await Promise.resolve(searchParams)
  const tableParam = params?.table
  const tableName = tableParam && isAllowedTable(tableParam)
    ? tableParam
    : DEFAULT_TABLE

  const supabase = getSupabase()
  let rows: Record<string, unknown>[] | null = null
  let error: Error | null = null

  if (supabase) {
    const result = await supabase
      .from(tableName)
      .select('*')
    rows = result.data
    error = result.error
  }

  const columns =
    rows && rows.length > 0
      ? (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      : []

  return (
    <div className="content-page">
      <h1 className="page-title">Assignment 2</h1>
      <Suspense fallback={<div className="table-select-wrap">Loading…</div>}>
        <TableSelect tables={ALLOWED_TABLES} currentTable={tableName} />
      </Suspense>
      <p className="page-subtitle">Table: {tableName}</p>
      {!supabase ? (
        <p className="error">
          Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) or in Vercel
          Project → Settings → Environment Variables.
        </p>
      ) : error ? (
        <p className="error">
          Failed to load: {error.message}. Check your Supabase URL and anon
          key.
        </p>
      ) : rows && rows.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col)}>{String(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col)}>
                      {row[col] != null ? String(row[col]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No rows in this table.</p>
      )}
    </div>
  )
}
