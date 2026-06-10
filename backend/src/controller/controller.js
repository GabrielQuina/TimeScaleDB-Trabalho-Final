import service from "../service/service.js"

function handleError(res, message, err) {
    console.error(message, err)
    res.status(500).json({
        error: message,
        details: process.env.NODE_ENV === "production" ? undefined : err.message,
    })
}

function validarDataCenter(body) {
    const requiredFields = ["dataCenter", "temperature", "sector", "room"]
    const missingFields = requiredFields.filter((field) => body[field] === undefined || body[field] === "")

    if (missingFields.length) {
        return `Campos obrigatorios ausentes: ${missingFields.join(", ")}`
    }

    if (Number.isNaN(Number(body.temperature))) {
        return "Temperatura precisa ser numerica"
    }

    return null
}

async function teste(req, res) {
    const request = await service.teste()

    res.send(request)
}

async function listarDataCenters(req, res) {
    try {
        const dataCenters = await service.listarDataCenters(req.db, req.query)

        res.json(dataCenters)
    } catch (err) {
        handleError(res, "Erro ao consultar data centers", err)
    }
}

async function buscarDataCenterPorId(req, res) {
    try {
        const dataCenter = await service.buscarDataCenterPorId(req.db, req.params.id)

        if (!dataCenter) {
            return res.status(404).json({ error: "Data center nao encontrado" })
        }

        res.json(dataCenter)
    } catch (err) {
        handleError(res, "Erro ao buscar data center", err)
    }
}

async function criarDataCenter(req, res) {
    try {
        const validationError = validarDataCenter(req.body)

        if (validationError) {
            return res.status(400).json({ error: validationError })
        }

        const dataCenter = await service.criarDataCenter(req.db, req.body)

        res.status(201).json(dataCenter)
    } catch (err) {
        handleError(res, "Erro ao criar data center", err)
    }
}

async function atualizarDataCenter(req, res) {
    try {
        const validationError = validarDataCenter(req.body)

        if (validationError) {
            return res.status(400).json({ error: validationError })
        }

        const dataCenter = await service.atualizarDataCenter(req.db, req.params.id, req.body)

        if (!dataCenter) {
            return res.status(404).json({ error: "Data center nao encontrado" })
        }

        res.json(dataCenter)
    } catch (err) {
        handleError(res, "Erro ao atualizar data center", err)
    }
}

async function removerDataCenter(req, res) {
    try {
        const dataCenter = await service.removerDataCenter(req.db, req.params.id)

        if (!dataCenter) {
            return res.status(404).json({ error: "Data center nao encontrado" })
        }

        res.status(204).send()
    } catch (err) {
        handleError(res, "Erro ao remover data center", err)
    }
}

async function obterEstatisticas(req, res) {
    try {
        const stats = await service.obterEstatisticas(req.db)

        res.json(stats)
    } catch (err) {
        handleError(res, "Erro ao calcular estatisticas", err)
    }
}

async function listarLogsComUsuarios(req, res) {
    try {
        const logs = await service.listarLogsComUsuarios(req.db)

        res.json(logs)
    } catch (err) {
        handleError(res, "Erro ao listar logs com usuarios", err)
    }
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
