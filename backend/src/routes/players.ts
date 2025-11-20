import { Router } from "express"
import { createPlayer, getPlayers, getPlayersByEvent, registerPlayerToEvent } from "../controllers/playerController"

const router = Router()

router.post("/", createPlayer)
router.get("/", getPlayers)
router.get("/event/:eventId", getPlayersByEvent)
router.post("/register-to-event", registerPlayerToEvent)

export default router
