import { Request, Response } from "express";
import Team from "../models/Team";
import Event from "../models/Event";
import Match from "../models/Match"; // Added Match import
import mongoose from "mongoose";

// Create a new team
export const createTeam = async (req: Request, res: Response) => {
    try {
        const { teamName, clubName, clubId, members, eventId } = req.body;

        // Validate members
        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ error: "Team must have at least one member" });
        }

        // Generate unique IDs for each member
        const membersWithIds = members.map((member: any) => ({
            ...member,
            uniqueId: `P-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        }));

        const team = new Team({
            teamName,
            clubName,
            clubId,
            members: membersWithIds,
            events: eventId ? [eventId] : [],
        });

        await team.save();

        // If eventId provided, add team to event
        if (eventId) {
            await Event.findByIdAndUpdate(eventId, {
                $addToSet: { teams: team._id },
            });
        }

        res.status(201).json(team);
    } catch (error: any) {
        console.error("Create team error:", error);
        res.status(500).json({ error: "Failed to create team", message: error.message });
    }
};

// Get team by ID
export const getTeamById = async (req: Request, res: Response) => {
    try {
        const team = await Team.findById(req.params.id).populate("events");
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch team", message: error.message });
    }
};

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
    try {
        const teams = await Team.find().populate("events");
        res.json(teams);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch teams", message: error.message });
    }
};

// Register team to an event
export const registerTeamToEvent = async (req: Request, res: Response) => {
    try {
        const { teamId, eventId } = req.body;

        if (!teamId || !eventId) {
            return res.status(400).json({ error: "teamId and eventId are required" });
        }

        // Find team by custom teamId string
        const team = await Team.findOne({ teamId: teamId });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Check if already registered
        if (team.events.includes(new mongoose.Types.ObjectId(eventId))) {
            return res.status(400).json({ error: "Team already registered for this event" });
        }

        // Add event to team
        team.events.push(new mongoose.Types.ObjectId(eventId));
        await team.save();

        // Add team to event
        await Event.findByIdAndUpdate(eventId, {
            $addToSet: { teams: team._id },
        });

        res.json(team);
    } catch (error: any) {
        console.error("Register team error:", error);
        res.status(500).json({ error: "Failed to register team", message: error.message });
    }
};

// Get teams for a specific event
export const getTeamsByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const teams = await Team.find({ events: eventId });
        res.json(teams);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch teams", message: error.message });
    }
};

// Get leaderboard based on match wins
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await Match.aggregate([
            { $match: { status: "completed", winnerId: { $exists: true } } },
            {
                $group: {
                    _id: "$winnerId",
                    wins: { $sum: 1 }
                }
            },
            { $sort: { wins: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "teams",
                    localField: "_id",
                    foreignField: "_id",
                    as: "teamDetails"
                }
            },
            { $unwind: "$teamDetails" },
            {
                $project: {
                    _id: 1,
                    wins: 1,
                    teamName: "$teamDetails.teamName",
                    clubName: "$teamDetails.clubName"
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error: any) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard", message: error.message });
    }
};
