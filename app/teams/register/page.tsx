"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

interface TeamMember {
    name: string
    age: number | string
    gender: "male" | "female" | "other" | ""
}

export default function RegisterTeamPage() {
    const [teamName, setTeamName] = useState("")
    const [clubName, setClubName] = useState("")
    const [members, setMembers] = useState<TeamMember[]>([
        { name: "", age: "", gender: "" }
    ])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [createdTeam, setCreatedTeam] = useState<any>(null)
    const [error, setError] = useState("")

    const addMember = () => {
        setMembers([...members, { name: "", age: "", gender: "" }])
    }

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index))
        }
    }

    const updateMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...members]
        if (field === "age") {
            updated[index][field] = value === "" ? "" : parseInt(value)
        } else {
            updated[index][field] = value as any
        }
        setMembers(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate members
            const validMembers = members.filter(m => m.name && m.age && m.gender)
            if (validMembers.length === 0) {
                setError("Please add at least one complete team member")
                setLoading(false)
                return
            }

            const teamData = {
                teamName,
                clubName,
                members: validMembers.map(m => ({
                    ...m,
                    age: typeof m.age === "string" ? parseInt(m.age) : m.age
                }))
            }

            const team = await api.teams.create(teamData)
            console.log("Team created:", team)
            setCreatedTeam(team)
            setSuccess(true)

            // Reset form
            setTeamName("")
            setClubName("")
            setMembers([{ name: "", age: "", gender: "" }])
        } catch (err) {
            setError("Failed to register team. Please try again.")
            console.error("Team registration error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Register Team</h1>
                    <p className="text-muted-foreground">Add a new team to the tournament system</p>
                </div>

                {success && createdTeam ? (
                    <Card className="p-8 border-2 border-green-500 bg-green-50 dark:bg-green-950">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
                                ✓ Team Registered Successfully!
                            </h2>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <strong>Team Name:</strong> {createdTeam.teamName}
                                </p>
                                <p className="text-sm">
                                    <strong>Club:</strong> {createdTeam.clubName}
                                </p>
                                <p className="text-sm">
                                    <strong>Team ID:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{createdTeam.teamId}</code>
                                </p>
                                <p className="text-sm">
                                    <strong>Members:</strong> {createdTeam.members?.length || 0}
                                </p>
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Team Members:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {createdTeam.members?.map((member: any, idx: number) => (
                                            <li key={idx} className="text-sm">
                                                {member.name} ({member.age} years, {member.gender}) - ID: {member.uniqueId}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    setSuccess(false)
                                    setCreatedTeam(null)
                                }}
                                className="mt-4"
                            >
                                Register Another Team
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-8 border border-border">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Team Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Team Information</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Team Name *</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full px-4 py-2 border border-input rounded-md bg-background"
                                        placeholder="Enter team name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Club Name *</label>
                                    <input
                                        type="text"
                                        value={clubName}
                                        onChange={(e) => setClubName(e.target.value)}
                                        className="w-full px-4 py-2 border border-input rounded-md bg-background"
                                        placeholder="Enter club name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Team Members</h3>
                                    <Button type="button" onClick={addMember} variant="outline" size="sm">
                                        + Add Member
                                    </Button>
                                </div>

                                {members.map((member, index) => (
                                    <Card key={index} className="p-4 bg-muted/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-medium">Member {index + 1}</h4>
                                            {members.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => removeMember(index)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Name *</label>
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(index, "name", e.target.value)}
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                                    placeholder="Player name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Age *</label>
                                                <input
                                                    type="number"
                                                    value={member.age}
                                                    onChange={(e) => updateMember(index, "age", e.target.value)}
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                                    placeholder="Age"
                                                    min="1"
                                                    max="120"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Gender *</label>
                                                <select
                                                    value={member.gender}
                                                    onChange={(e) => updateMember(index, "gender", e.target.value)}
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                                    required
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Registering..." : "Register Team"}
                            </Button>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    )
}
