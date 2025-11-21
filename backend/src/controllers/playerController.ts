import type { Request, Response } from "express"
import Player from "../models/Player"
import Club from "../models/Club"
import crypto from "crypto"
import mongoose from "mongoose"

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
      clubName,
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
    const { playerId, eventId, uniqueId } = req.body
    console.log("Registering player:", { playerId, eventId, uniqueId });

    let player;
    if (playerId) {
      player = await Player.findById(playerId)
    } else if (uniqueId) {
      const trimmedId = uniqueId.trim();
      console.log("Searching for uniqueId:", trimmedId);

      // Check if uniqueId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(trimmedId)) {
        player = await Player.findById(trimmedId);
        console.log("Found by ObjectId:", !!player);
      }
      // If not found by ID or not a valid ID, try finding by uniqueId field
      if (!player) {
        player = await Player.findOne({ uniqueId: trimmedId })
        console.log("Found by uniqueId field:", !!player);
      }
    }

    if (!player) {
      console.log("Player not found in DB");
      return res.status(404).json({ error: "Player not found" })
    }

    // Check if already registered
    if (player.events.includes(eventId)) {
      return res.status(400).json({ error: "Player already registered for this event" })
    }

    console.log("Pushing eventId:", eventId);
    console.log("Events before push:", player.events);

    player.events.push(new mongoose.Types.ObjectId(eventId))

    console.log("Events after push:", player.events);
    console.log("Player object before save:", JSON.stringify(player.toObject()));

    try {
      const savedPlayer = await player.save()
      console.log("Save successful!");
      console.log("Saved player events:", savedPlayer.events);
      console.log("Saved player object:", JSON.stringify(savedPlayer.toObject()));

      res.json(savedPlayer)
    } catch (saveError: any) {
      console.error("Save error:", saveError);
      console.error("Save error details:", JSON.stringify(saveError, null, 2));
      return res.status(500).json({ error: "Failed to save player", details: saveError.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to register player", message: error.message })
  }
}
