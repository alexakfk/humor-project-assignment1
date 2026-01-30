import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const TABLE_NAME = 'humor_flavors'

export default async function ListPage() {
  const { data: rows, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return (
      <main className="container">
        <h1>List: {TABLE_NAME}</h1>
        <p className="error">
          Failed to load: {error.message}. Check your Supabase URL and anon key in .env.local.
        </p>
        <Link href="/">← Back home</Link>
      </main>
    )
  }

  const columns =
    rows && rows.length > 0
      ? (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      : []

  return (
    <main className="container list-page">
      <h1>List: {TABLE_NAME}</h1>
      <Link href="/">← Back home</Link>
      {rows && rows.length > 0 ? (
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
    </main>
  )
}
