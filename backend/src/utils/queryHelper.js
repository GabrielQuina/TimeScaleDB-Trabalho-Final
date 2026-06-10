// Helper para executar queries
export async function executeQuery(pool, query, params = []) {
  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (err) {
    console.error('Erro na query:', err)
    throw err
  }
}

export async function executeQueryOne(pool, query, params = []) {
  const results = await executeQuery(pool, query, params)
  return results[0] || null
}
