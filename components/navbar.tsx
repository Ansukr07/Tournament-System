"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-black">X</span>
            </div>
            <span>XTHLETE</span>
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition">
              Events
            </Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Leaderboard
            </Link>
            <Link href="/my-matches" className="text-sm text-muted-foreground hover:text-foreground transition">
              My Matches
            </Link>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition">
                Login
              </Link>
            </Button>
            <Button size="sm" className="bg-accent">
              <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground transition">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
