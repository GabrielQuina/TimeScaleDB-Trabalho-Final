// Exemplo de como usar o pool de conexão no controller

async function teste(req, res) {
  try {
    // Opção 1: Usar req.db.query() diretamente
    const result = await req.db.query("SELECT NOW() as tempo")
    res.json({ 
      mensagem: "Deu tudo certo",
      horario: result.rows[0].tempo
    })
  } catch (err) {
    console.error('Erro:', err)
    res.status(500).json({ erro: err.message })
  }
}

async function exemplo(req, res) {
  try {
    // Exemplo com parâmetros seguros (prepared statements)
    const { id } = req.query
    const result = await req.db.query(
      "SELECT * FROM sua_tabela WHERE id = $1", 
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erro:', err)
    res.status(500).json({ erro: err.message })
  }
}

export default { teste, exemplo }
