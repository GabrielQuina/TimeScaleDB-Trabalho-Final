
function teste() {

    const resultado = "Deu tudo certo"

    return resultado
}

async function listarDataCenters(db) {
    const result = await db.query(`
        SELECT
            id,
            data_center AS "dataCenter",
            temperature,
            sector,
            room
        FROM data_center_readings
        ORDER BY recorded_at DESC
    `)

    return result.rows
}

export default { teste, listarDataCenters }
