import { Router } from "express"
import controller from "../controller/controller.js"

const router = Router()

router.get("/teste", controller.teste)
router.get("/datacenters", controller.listarDataCenters)
router.get("/datacenters/stats", controller.obterEstatisticas)
router.get("/datacenters/:id", controller.buscarDataCenterPorId)
router.post("/datacenters", controller.criarDataCenter)
router.put("/datacenters/:id", controller.atualizarDataCenter)
router.delete("/datacenters/:id", controller.removerDataCenter)
router.get("/reports/logs", controller.listarLogsComUsuarios)

export default router
