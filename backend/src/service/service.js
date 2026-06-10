function teste() {
    return "Deu tudo certo"
}

function buildDataCenterFilters(query) {
    const conditions = []
    const values = []

    if (query.sector) {
        values.push(query.sector)
        conditions.push(`sector = $${values.length}`)
    }

    if (query.tag) {
        values.push(query.tag)
        conditions.push(`$${values.length} = ANY(tags)`)
    }

    if (query.minTemperature) {
        values.push(Number(query.minTemperature))
        conditions.push(`temperature >= $${values.length}`)
    }

    if (query.maxTemperature) {
        values.push(Number(query.maxTemperature))
        conditions.push(`temperature <= $${values.length}`)
    }

    return {
        where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        values,
    }
}

async function listarDataCenters(db, query = {}) {
    const { where, values } = buildDataCenterFilters(query)

    const result = await db.query(`
        SELECT
            id,
            data_center AS "dataCenter",
            temperature,
            sector,
            room,
            tags,
            metadata,
            recorded_at AS "recordedAt"
        FROM data_center_readings
        ${where}
        ORDER BY recorded_at DESC
    `, values)

    return result.rows
}

async function buscarDataCenterPorId(db, id) {
    const result = await db.query(`
        SELECT
            id,
            data_center AS "dataCenter",
            temperature,
            sector,
            room,
            tags,
            metadata,
            recorded_at AS "recordedAt"
        FROM data_center_readings
        WHERE id = $1
        LIMIT 1
    `, [id])

    return result.rows[0] || null
}

async function criarDataCenter(db, data) {
    const result = await db.query(`
        INSERT INTO data_center_readings (
            data_center,
            temperature,
            sector,
            room,
            tags,
            metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            data_center AS "dataCenter",
            temperature,
            sector,
            room,
            tags,
            metadata,
            recorded_at AS "recordedAt"
    `, [
        data.dataCenter,
        Number(data.temperature),
        data.sector,
        data.room,
        data.tags || [],
        data.metadata || {},
    ])

    return result.rows[0]
}

async function atualizarDataCenter(db, id, data) {
    const result = await db.query(`
        UPDATE data_center_readings
        SET
            data_center = $2,
            temperature = $3,
            sector = $4,
            room = $5,
            tags = $6,
            metadata = $7
        WHERE id = $1
        RETURNING
            id,
            data_center AS "dataCenter",
            temperature,
            sector,
            room,
            tags,
            metadata,
            recorded_at AS "recordedAt"
    `, [
        id,
        data.dataCenter,
        Number(data.temperature),
        data.sector,
        data.room,
        data.tags || [],
        data.metadata || {},
    ])

    return result.rows[0] || null
}

async function removerDataCenter(db, id) {
    const result = await db.query(`
        DELETE FROM data_center_readings
        WHERE id = $1
        RETURNING id
    `, [id])

    return result.rows[0] || null
}

async function obterEstatisticas(db) {
    const setores = await db.query(`
        SELECT
            sector,
            COUNT(*)::int AS total,
            ROUND(AVG(temperature)::numeric, 2)::float AS "averageTemperature",
            MAX(temperature)::float AS "maxTemperature",
            MIN(temperature)::float AS "minTemperature"
        FROM data_center_readings
        GROUP BY sector
        ORDER BY "averageTemperature" DESC
    `)

    const tags = await db.query(`
        SELECT
            tag,
            COUNT(*)::int AS total
        FROM data_center_readings,
        LATERAL unnest(tags) AS tag
        GROUP BY tag
        ORDER BY total DESC, tag ASC
    `)

    const sensores = await db.query(`
        SELECT
            data_center AS "dataCenter",
            sensor->>'name' AS sensor,
            sensor->>'status' AS status
        FROM data_center_readings
        CROSS JOIN LATERAL jsonb_array_elements(metadata->'sensors') AS sensor
        ORDER BY data_center ASC
    `)

    return {
        setores: setores.rows,
        tags: tags.rows,
        sensores: sensores.rows,
    }
}

async function listarLogsComUsuarios(db) {
    const result = await db.query(`
        SELECT
            logs.id,
            logs.level,
            logs.message,
            logs.timestamp,
            logs.metadata,
            users.username,
            users.email
        FROM logs
        LEFT JOIN users ON users.id = logs.user_id
        ORDER BY logs.timestamp DESC
    `)

    return result.rows
}

export default {
    teste,
    listarDataCenters,
    buscarDataCenterPorId,
    criarDataCenter,
    atualizarDataCenter,
    removerDataCenter,
    obterEstatisticas,
    listarLogsComUsuarios,
}
