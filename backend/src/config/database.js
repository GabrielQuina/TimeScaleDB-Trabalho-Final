import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  host: process.env.TIMESCALEDB_HOST || 'localhost',
  port: process.env.TIMESCALEDB_PORT || 5432,
  user: process.env.TIMESCALEDB_USER || 'postgres',
  password: process.env.TIMESCALEDB_PASSWORD,
  database: process.env.TIMESCALEDB_DB || 'timescaledb',
})

pool.on('error', (err) => {
  console.error('Erro no pool de conexão:', err)
})

export default pool
