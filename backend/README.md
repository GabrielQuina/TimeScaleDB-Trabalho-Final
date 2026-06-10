# Backend com TimescaleDB

## Conceitos principais

TimescaleDB e uma extensao do PostgreSQL focada em series temporais. Ele nao e um banco NoSQL puro como MongoDB ou Cassandra, mas atende ao trabalho como banco especializado nao relacional/tradicional por adicionar recursos orientados a tempo, hypertables, chunks, compressao, agregacoes temporais e suporte a dados semiestruturados com JSONB e arrays.

## Tipo de banco

- Modelo base: relacional SQL, por ser construido sobre PostgreSQL.
- Especializacao: banco de series temporais.
- Recursos usados no projeto: hypertables, dados JSONB, arrays, agregacoes, filtros, joins e indices GIN.

## Classificacao CAP

Em uma execucao single-node, o TimescaleDB/PostgreSQL privilegia consistencia e disponibilidade local. Em cenarios distribuidos, o sistema tende a priorizar consistencia sobre disponibilidade em particoes de rede, portanto e mais proximo de CP do que AP. Ele nao e indicado para cenarios em que a aplicacao aceita dados divergentes entre replicas para manter escrita sempre disponivel.

## Casos de uso

- Monitoramento de temperatura, sensores e IoT.
- Metricas de infraestrutura e observabilidade.
- Series financeiras.
- Logs de aplicacao.
- Eventos com timestamp e necessidade de agregacao por janelas de tempo.

## Ferramentas e ecossistema

- Docker e Docker Compose para execucao local.
- `psql` para operacoes administrativas.
- PostgreSQL clients como DBeaver, pgAdmin e Beekeeper Studio.
- Node.js com `pg` para acesso pela API.
- Recursos PostgreSQL: SQL, JSONB, arrays, indices GIN, joins e views.

## Como executar

```bash
docker compose up -d
npm install
npm run db:schema
npm start
```

Health check:

```text
http://localhost:8000/health
```

## Endpoints CRUD

- `GET /datacenters`: lista leituras. Aceita filtros `sector`, `tag`, `minTemperature` e `maxTemperature`.
- `GET /datacenters/:id`: busca uma leitura.
- `POST /datacenters`: cria uma leitura.
- `PUT /datacenters/:id`: atualiza uma leitura.
- `DELETE /datacenters/:id`: remove uma leitura.
- `GET /datacenters/stats`: retorna agregacoes por setor, tags e sensores em JSONB.
- `GET /reports/logs`: demonstra join entre logs e usuarios.

## Mapeamento dos requisitos de consulta

| Requisito | Equivalente usado no projeto |
| --- | --- |
| `find` | `SELECT ... FROM data_center_readings` em `GET /datacenters` |
| `aggregate` | `GET /datacenters/stats` |
| `$match` | filtros `WHERE sector = ...`, `temperature >= ...`, `tag = ANY(tags)` |
| `$project` | aliases SQL como `data_center AS "dataCenter"` |
| `$lookup` | `LEFT JOIN users ON users.id = logs.user_id` em `/reports/logs` |
| `$unwind` | `LATERAL unnest(tags)` e `jsonb_array_elements(metadata->'sensors')` |
| `$group` | `GROUP BY sector` e `GROUP BY tag` |
| Arrays | coluna `tags TEXT[]` |
| Subdocumentos | coluna `metadata JSONB` com `rack`, `humidity` e `sensors[]` |

## Exemplo de payload

```json
{
  "dataCenter": "Permafrost Oeste",
  "temperature": 27.5,
  "sector": "Storage",
  "room": "Sala 04",
  "tags": ["storage", "normal"],
  "metadata": {
    "rack": "D4",
    "humidity": 48,
    "sensors": [
      {
        "name": "temp-04",
        "status": "ok"
      }
    ]
  }
}
```
