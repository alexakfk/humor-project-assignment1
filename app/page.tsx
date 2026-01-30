import { supabase } from '@/lib/supabase'

const TABLE_NAME = 'humor_flavors'

export default async function Home() {
  const { data: rows, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('id', { ascending: true })

  const columns =
    rows && rows.length > 0
      ? (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      : []

  return (
    <main className="single-page">
      <div className="card greeting-card">
        <h1>hello world</h1>
        <h2>i'm alexa kafka :)</h2>
      </div>

      <div className="card table-card">
        <h2>Assignment 2</h2>
        <hr></hr>
        <h3 className="table-title">List chosen: {TABLE_NAME}</h3>
        {error ? (
          <p className="error">
            Failed to load: {error.message}. Check your Supabase URL and anon key in .env.local.
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
    </main>
  )
}
