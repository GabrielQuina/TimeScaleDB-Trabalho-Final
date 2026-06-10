CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    value DOUBLE PRECISION,
    metadata JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable('events', 'created_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_events_name_time
ON events (name, created_at DESC);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL,
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id INTEGER REFERENCES users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable('logs', 'timestamp', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_logs_level_time
ON logs (level, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_logs_user_time
ON logs (user_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS data_center_readings (
    id SERIAL,
    data_center VARCHAR(255) NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    sector VARCHAR(100) NOT NULL,
    room VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE data_center_readings
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;

ALTER TABLE data_center_readings
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

SELECT create_hypertable('data_center_readings', 'recorded_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_data_center_readings_time
ON data_center_readings (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_center_readings_sector_time
ON data_center_readings (sector, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_center_readings_tags
ON data_center_readings USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_data_center_readings_metadata
ON data_center_readings USING GIN (metadata);

INSERT INTO users (username, email) VALUES
('usuario1', 'usuario1@example.com'),
('usuario2', 'usuario2@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO data_center_readings (
    data_center,
    temperature,
    sector,
    room,
    tags,
    metadata
)
SELECT data_center, temperature, sector, room, tags, metadata
FROM (
    VALUES
    (
        'Permafrost Norte',
        24.7,
        'Infraestrutura',
        'Sala 01',
        ARRAY['principal', 'refrigerado']::TEXT[],
        '{"rack":"A1","humidity":42,"sensors":[{"name":"temp-01","status":"ok"}]}'::jsonb
    ),
    (
        'Permafrost Sul',
        31.4,
        'Backup',
        'Sala 02',
        ARRAY['backup', 'alerta']::TEXT[],
        '{"rack":"B2","humidity":56,"sensors":[{"name":"temp-02","status":"warning"}]}'::jsonb
    ),
    (
        'Permafrost Leste',
        36.2,
        'Processamento',
        'Sala 03',
        ARRAY['critico', 'gpu']::TEXT[],
        '{"rack":"C3","humidity":61,"sensors":[{"name":"temp-03","status":"critical"}]}'::jsonb
    )
) AS seed_data(data_center, temperature, sector, room, tags, metadata)
WHERE NOT EXISTS (SELECT 1 FROM data_center_readings);

INSERT INTO logs (level, message, user_id, metadata)
SELECT level, message, user_id, metadata
FROM (
    VALUES
    ('INFO', 'Usuario autenticado', 1, '{"source":"api"}'::jsonb),
    ('WARNING', 'Falha de conexao', 2, '{"source":"network"}'::jsonb),
    ('ERROR', 'Erro de banco de dados', 1, '{"source":"database"}'::jsonb)
) AS seed_logs(level, message, user_id, metadata)
WHERE NOT EXISTS (SELECT 1 FROM logs);
