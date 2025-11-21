import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Trophy, Users, Zap, Target } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                <div className="absolute inset-0 flex items-center justify-center bg-background " />

                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Empowering Sports Communities
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        CourtFlow is the ultimate platform for organizing tournaments, managing teams, and tracking performance. We bring professional-grade tools to local sports communities.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-muted-foreground mb-4">
                                We believe that every athlete deserves a professional experience, regardless of the level they play at. Our mission is to simplify the complexities of tournament management so that organizers can focus on what matters most: the game.
                            </p>
                            <p className="text-muted-foreground">
                                From automated fixture generation to real-time leaderboards, we provide the infrastructure that powers competitive spirit and community growth.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-6 bg-background border-border hover:border-accent/50 transition">
                                <Trophy className="h-8 w-8 text-accent mb-4" />
                                <h3 className="font-bold mb-2">Tournaments</h3>
                                <p className="text-sm text-muted-foreground">Seamless organization</p>
                            </Card>
                            <Card className="p-6 bg-background border-border hover:border-accent/50 transition">
                                <Users className="h-8 w-8 text-blue-500 mb-4" />
                                <h3 className="font-bold mb-2">Community</h3>
                                <p className="text-sm text-muted-foreground">Connect athletes</p>
                            </Card>
                            <Card className="p-6 bg-background border-border hover:border-accent/50 transition">
                                <Zap className="h-8 w-8 text-yellow-500 mb-4" />
                                <h3 className="font-bold mb-2">Real-time</h3>
                                <p className="text-sm text-muted-foreground">Live updates</p>
                            </Card>
                            <Card className="p-6 bg-background border-border hover:border-accent/50 transition">
                                <Target className="h-8 w-8 text-green-500 mb-4" />
                                <h3 className="font-bold mb-2">Analytics</h3>
                                <p className="text-sm text-muted-foreground">Performance tracking</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section (Optional Placeholder) */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Built by Athletes, for Athletes</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our team consists of passionate developers and sports enthusiasts dedicated to elevating the grassroots sports ecosystem.
                    </p>
                </div>
            </section>
        </div>
    )
}
