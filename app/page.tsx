import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { EventsGrid } from "@/components/events-grid"
import { LeaderboardPreview } from "@/components/leaderboard-preview"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <EventsGrid />
      <LeaderboardPreview />
    </div>
  )
}
