-- Script de inicialização do banco de dados TimeScaleDB
-- Execute este script assim que conectar ao seu banco de dados

-- Criar extensão TimescaleDB (se não existir)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Exemplo: Criar uma tabela de eventos com timestamps (ideal para TimeScaleDB)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    value FLOAT,
    metadata JSONB
);

-- Converter em hypertable para melhor performance com séries temporais
SELECT create_hypertable('events', 'created_at', if_not_exists => TRUE);

-- Criar índice composto
CREATE INDEX IF NOT EXISTS idx_events_name_time ON events (name, created_at DESC);

-- Exemplo 2: Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Exemplo 3: Tabela de logs com série temporal
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id INTEGER REFERENCES users(id),
    metadata JSONB
);

SELECT create_hypertable('logs', 'timestamp', if_not_exists => TRUE);

-- Criar índices para melhor query performance
CREATE INDEX IF NOT EXISTS idx_logs_level_time ON logs (level, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_time ON logs (user_id, timestamp DESC);

-- Inserir alguns dados de exemplo
INSERT INTO users (username, email) VALUES 
('usuario1', 'usuario1@example.com'),
('usuario2', 'usuario2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO logs (level, message, user_id) VALUES
('INFO', 'Usuário autenticado', 1),
('WARNING', 'Falha de conexão', 2),
('ERROR', 'Erro de banco de dados', 1)
ON CONFLICT DO NOTHING;

-- Query de exemplo: buscar eventos nos últimos 7 dias
-- SELECT * FROM events 
-- WHERE created_at > NOW() - INTERVAL '7 days'
-- ORDER BY created_at DESC;

-- Query de exemplo: contar logs por nível
-- SELECT level, COUNT(*) FROM logs 
-- GROUP BY level;

-- Query de exemplo: aggregação por hora (típico de séries temporais)
-- SELECT time_bucket('1 hour', timestamp) as bucket, COUNT(*)
-- FROM logs
-- GROUP BY bucket
-- ORDER BY bucket DESC;
