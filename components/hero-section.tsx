"use client"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-pretty">
              Professional Tournament Management at Your Fingertips
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Create tournaments, generate intelligent fixtures, track live scores, and manage umpires with XTHLETE's
              comprehensive tournament engine.
            </p>
            <div className="flex gap-4">
              <Button className="bg-accent hover:bg-accent/90 h-12 px-8">Create Tournament</Button>
              <Button variant="outline" className="h-12 px-8 bg-transparent">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚡</div>
              <p className="text-muted-foreground">Tournament Management Platform</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
