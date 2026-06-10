import { Router } from "express"
import controller from "../controller/controller.js"

const router = Router()

router.get("/teste", controller.teste)
router.get("/datacenters", controller.listarDataCenters)

export default router
