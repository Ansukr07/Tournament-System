"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("📡 Sending login request...");
      const result = await api.auth.login(formData.email, formData.password);

      console.log("🔐 Login result:", result);

      if (!result.token) {
        throw new Error("❌ Backend did NOT return a token");
      }

      console.log("💾 Saving token to localStorage:", result.token);

      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("role", result.role);

      console.log("🎉 Token saved! Redirecting...");

      router.push(result.role === "admin" ? "/admin/dashboard" : "/leaderboard");

    } catch (err: any) {
      console.error("❌ Login failed:", err);
      setError(err.message || "Invalid credentials");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to CourtFlow tournament system</p>
        </div>

        <Card className="p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-10" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-accent hover:underline font-medium">
              Sign up
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
