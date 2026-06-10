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
        res.status(500).json({ error: "Erro ao consultar data centers" })
    }
}

export default { teste, listarDataCenters }
