import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import Match from "../models/Match";
import Player from "../models/Player";
import Team from "../models/Team";
import { generateKnockoutFixtures, generateRoundRobinFixtures } from "../services/fixtureService";
import { SchedulingEngine } from "../services/schedulingEngine";
import { generateMatchCodeForMatch } from "../services/matchService";

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
    // Use aggregation to count teams for each event
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "events",
          as: "registeredTeams"
        }
      },
      {
        $addFields: {
          participantCount: { $size: "$registeredTeams" }
        }
      },
      {
        $project: {
          registeredTeams: 0 // Remove the heavy array, keep only the count
        }
      }
    ]);

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
    (eventObj as any).participantCount = teams.length; // Add explicit count

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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.courts || event.courts.length === 0) {
      return res.status(400).json({ message: "Event must have at least one court defined" });
    }

    // Get all unscheduled matches
    const matches = await Match.find({
      eventId,
      status: { $in: ["scheduled", "pending"] },
      startTime: { $exists: false }
    });

    if (matches.length === 0) {
      return res.status(400).json({ message: "No matches to schedule" });
    }

    // Determine start time (Event start date or tomorrow 9 AM)
    let startTime = event.startDate ? new Date(event.startDate) : new Date();
    if (!event.startDate) {
      startTime.setHours(9, 0, 0, 0);
      startTime.setDate(startTime.getDate() + 1);
    }

    // Run scheduling engine
    const scheduled = SchedulingEngine.scheduleMatches(
      matches,
      event.courts,
      startTime,
      event.matchDuration || 30,
      event.bufferMinutes || 10
    );

    // Save scheduled matches
    await Promise.all(scheduled.map(m => m.save()));

    // Generate match codes for all scheduled matches
    console.log("Generating match codes for scheduled matches...");
    await Promise.all(scheduled.map(m => generateMatchCodeForMatch(m._id.toString())));

    res.json({
      message: "Schedule generated successfully",
      matches: scheduled,
      count: scheduled.length
    });
  } catch (error: any) {
    console.error("Schedule matches error:", error);
    res.status(500).json({ message: "Error scheduling matches", error: error.message });
  }
};

import TeamStats from "../models/TeamStats";

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

export const getEventLeaderboard = async (req: Request, res: Response) => {
  try {
    const stats = await TeamStats.find({ eventId: req.params.id })
      .populate("teamId", "teamName clubName")
      .sort({ points: -1, goalDifference: -1, won: -1 });

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
};
