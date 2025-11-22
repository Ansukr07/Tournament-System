"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    setIsLoggedIn(!!token)
  }, [])

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-pretty">
              Professional Tournament Management at Your Fingertips
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Create tournaments, generate intelligent fixtures, track live scores, and manage umpires with CourtFlow's
              comprehensive tournament engine.
            </p>
            <div className="flex gap-4">
              <Link href={isLoggedIn ? "/admin/create-event" : "/auth/login"}>
                <Button className="bg-accent hover:bg-accent/90 h-12 px-8">
                  Create Tournament
                </Button>
              </Link>
              <a href="https://drive.google.com/file/d/1pMMS2Oezzi9IuS900d02C9Azqua7uQ4Z/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-12 px-8 bg-transparent">
                  Watch Demo
                </Button>
              </a>
            </div>
          </div>
          <div className="relative bg-card rounded-lg border border-border p-8 h-80 overflow-hidden">
            <img
              src="/abc.jpeg"
              alt="Image"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>


        </div>
      </div>
    </section>
  )
}
