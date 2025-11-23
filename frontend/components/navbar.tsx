"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null
    setToken(stored)
    setRole(userRole)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    setToken(null)
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-13 h-13 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo2.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span>CourtFlow</span>
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition">
              Events
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About Us
            </Link>
            <a href="https://drive.google.com/file/d/1pMMS2Oezzi9IuS900d02C9Azqua7uQ4Z/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition">
              Demo
            </a>
            {token && role === "umpire" && (
              <Link href="/umpire" className="text-sm text-muted-foreground hover:text-foreground transition">
                Umpire Dashboard
              </Link>
            )}
            {token && role === "admin" && (
              <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                Admin Dashboard
              </Link>
            )}
            {token && role !== "admin" && role !== "umpire" && (
              <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                Leaderboard
              </Link>
            )}
          </div>

          <div className="flex gap-2">
            {token ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <Link href="/auth/login" className="text-sm ">
                    Login
                  </Link>
                </Button>
                <Button size="sm" className="bg-accent">
                  <Link href="/auth/register" className="text-sm ">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
