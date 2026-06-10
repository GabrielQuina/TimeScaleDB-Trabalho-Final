import service from "../service/service.js"

async function teste(req, res) {

    const request = await service.teste()

    res.send(request)
    
}

async function listarDataCenters(req, res) {
    try {
        const dataCenters = await service.listarDataCenters(req.db)

        res.json(dataCenters)
    } catch (err) {
        console.error("Erro ao listar data centers:", err)
        res.status(500).json({
            error: "Erro ao consultar data centers",
            details: process.env.NODE_ENV === "production" ? undefined : err.message,
        })
    }
}

export default { teste, listarDataCenters }
