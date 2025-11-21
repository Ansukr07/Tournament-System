import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import Match from "../models/Match";
import Player from "../models/Player";
import Team from "../models/Team";
import { generateKnockoutFixtures, generateRoundRobinFixtures } from "../services/fixtureService";
import { scheduleMatches } from "../services/schedulingService";

export const createEvent = async (req: Request, res: Response) => {
  try {
    console.log("Incoming event body:", req.body);

    const {
      name,
      category,
      type,
      matchDuration,
      bufferMinutes,
      courts,
      startDate,
      endDate
    } = req.body;

    if (!name || !category || !type) {
      return res.status(400).json({ message: "Missing required fields: name, category or type" });
    }

    const safeStartDate = startDate ? new Date(startDate) : undefined;
    const safeEndDate = endDate ? new Date(endDate) : undefined;

    const event = new Event({
      name,
      category,
      type,
      matchDuration,
      bufferMinutes,
      courts,
      ...(safeStartDate && { startDate: safeStartDate }),
      ...(safeEndDate && { endDate: safeEndDate }),
    });

    await event.save();
    res.status(201).json(event);

  } catch (error: any) {
    console.error("Create Event Error:", error.message);
    res.status(500).json({
      message: "Error creating event",
      error: error.message || "Unknown error",
    });
  }
};


export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    console.log("Fetching teams for event:", req.params.id);

    // Fetch teams registered for this event
    const teams = await Team.find({
      events: { $in: [req.params.id, new mongoose.Types.ObjectId(req.params.id)] }
    });
    console.log("Found teams:", teams.length);

    // Also fetch players for backward compatibility
    const participants = await Player.find({
      events: { $in: [req.params.id, new mongoose.Types.ObjectId(req.params.id)] }
    });

    const eventObj = event.toObject();
    (eventObj as any).teams = teams;
    (eventObj as any).participants = participants; // Keep for backward compatibility

    res.json(eventObj);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching event", error: error.message });
  }
};

export const generateFixtures = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { teamIds } = req.body; // Optional: specific teams to include

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // If specific teams provided, register them to the event
    if (teamIds && Array.isArray(teamIds)) {
      await Team.updateMany(
        { _id: { $in: teamIds } },
        { $addToSet: { events: eventId } }
      );
      await Event.findByIdAndUpdate(eventId, {
        $addToSet: { teams: { $each: teamIds } }
      });
    }

    // Check if teams are registered
    const existingTeams = await Team.find({ events: eventId });

    if (existingTeams.length === 0) {
      return res.status(400).json({
        message: "No teams registered for this event. Please add teams first."
      });
    }

    // Generate fixtures based on event type
    let matches;
    if (event.type === "round_robin") {
      matches = await generateRoundRobinFixtures(eventId);
    } else {
      // Default to knockout
      matches = await generateKnockoutFixtures(eventId);
    }

    res.json({
      message: `${event.type} fixtures generated successfully`,
      matches,
      count: matches.length,
      teamCount: existingTeams.length
    });
  } catch (error: any) {
    console.error("Generate fixtures error:", error);
    res.status(500).json({ message: "Error generating fixtures", error: error.message });
  }
};

export const scheduleEventMatches = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const matches = await scheduleMatches(eventId);

    res.json({
      message: "Schedule generated successfully",
      matches,
      count: matches.length
    });
  } catch (error: any) {
    console.error("Schedule matches error:", error);
    res.status(500).json({ message: "Error scheduling matches", error: error.message });
  }
};

export const getEventMatches = async (req: Request, res: Response) => {
  try {
    const matches = await Match.find({ eventId: req.params.id })
      .populate("participants.teamId")
      .populate("winnerId")
      .sort({ round: 1, startTime: 1 });

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching matches", error: error.message });
  }
};
