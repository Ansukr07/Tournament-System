import type { Request, Response } from "express"
import Player from "../models/Player"
import Club from "../models/Club"
import crypto from "crypto"

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { name, clubName, eventId } = req.body

    // Check for duplicate uniqueId if provided
    if (req.body.uniqueId) {
      const existingPlayer = await Player.findOne({ uniqueId: req.body.uniqueId })
      if (existingPlayer) {
        return res.status(400).json({ error: "Player with this unique ID already exists" })
      }
    }

    let club = await Club.findOne({ name: clubName })
    if (!club) {
      club = new Club({ name: clubName })
      await club.save()
    }

    // Check for duplicate name + club combination
    const duplicatePlayer = await Player.findOne({ name, clubId: club._id })
    if (duplicatePlayer) {
      return res.status(400).json({
        error: "Player with this name already exists in the club",
        playerId: duplicatePlayer._id
      })
    }

    const uniqueId = req.body.uniqueId || `P-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`

    const player = new Player({
      name,
      uniqueId,
      clubId: club._id,
      events: eventId ? [eventId] : []
    })

    await player.save()
    res.json(player)
  } catch (error: any) {
    res.status(500).json({ error: "Player creation failed", message: error.message })
  }
}

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const players = await Player.find().populate("clubId")
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players" })
  }
}

export const getPlayersByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const players = await Player.find({ events: eventId }).populate("clubId")
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players" })
  }
}

export const registerPlayerToEvent = async (req: Request, res: Response) => {
  try {
    const { playerId, eventId } = req.body

    const player = await Player.findById(playerId)
    if (!player) {
      return res.status(404).json({ error: "Player not found" })
    }

    // Check if already registered
    if (player.events.includes(eventId)) {
      return res.status(400).json({ error: "Player already registered for this event" })
    }

    player.events.push(eventId)
    await player.save()

    res.json(player)
  } catch (error: any) {
    res.status(500).json({ error: "Failed to register player", message: error.message })
  }
}
