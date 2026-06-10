import express from "express"
import router from "./routers/router.js"
import pool from "./config/database.js"

const app = express()

const port = process.env.PORT || 8000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Fazer pool disponível em req.db
app.use((req, res, next) => {
  req.db = pool
  next()
})

app.use("/", router)

// Health check
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json({ 
      status: "OK", 
      database: "Connected",
      timestamp: result.rows[0].now 
    })
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      database: "Disconnected",
      error: err.message 
    })
  }
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
    console.log(`Acesse http://localhost:${port}/health para verificar a conexão com TimeScaleDB`)
})