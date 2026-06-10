# Backend com TimeScaleDB

## Setup Inicial

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env` com suas credenciais do TimeScaleDB:
```
TIMESCALEDB_HOST=localhost
TIMESCALEDB_PORT=5432
TIMESCALEDB_USER=postgres
TIMESCALEDB_PASSWORD=sua_senha
TIMESCALEDB_DB=timescaledb
```

### 3. Iniciar servidor
```bash
npm start
```

## Verificar Conexão

Acesse: `http://localhost:8000/health`

Resposta esperada:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2026-06-09T21:42:00.000Z"
}
```

## Como Usar o Banco de Dados

### Exemplo 1: Executar Query no Controller

```javascript
import pool from "../config/database.js"

async function minhaFuncao(req, res) {
  try {
    const result = await pool.query("SELECT * FROM sua_tabela WHERE id = $1", [1])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
```

### Exemplo 2: Usar o Helper de Query no Service

```javascript
import { executeQuery } from "../utils/queryHelper.js"

export async function buscarDados(pool) {
  const dados = await executeQuery(
    pool, 
    "SELECT * FROM sua_tabela ORDER BY created_at DESC", 
    []
  )
  return dados
}
```

### Exemplo 3: Usar pool em Middleware

O `pool` está disponível em `req.db`:

```javascript
async function meuController(req, res) {
  const result = await req.db.query("SELECT COUNT(*) FROM sua_tabela")
  res.json(result.rows[0])
}
```

## Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Configuração do pool de conexão
│   ├── controller/             # Lógica dos endpoints
│   ├── routers/                # Definição de rotas
│   ├── service/                # Lógica de negócio
│   ├── utils/
│   │   └── queryHelper.js      # Helpers para queries
│   └── server.js               # Servidor Express
├── .env                        # Variáveis de ambiente
├── package.json
└── README.md
```

## Próximos Passos

1. **Criar tabelas no TimeScaleDB** com o schema de sua aplicação
2. **Adicionar migrations** para versionar o schema (opcional: usar `node-pg-migrate`)
3. **Criar models** na pasta `src/models/` para encapsular queries de cada tabela
4. **Implementar tratamento de erros** mais robusto
5. **Adicionar testes** com o banco de dados

## Recursos TimeScaleDB

- [Documentação TimeScaleDB](https://docs.timescale.com/)
- [Cliente PostgreSQL - node-postgres](https://node-postgres.com/)
