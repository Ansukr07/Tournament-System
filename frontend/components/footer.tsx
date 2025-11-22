import Link from "next/link"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-card/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold ">
                            CourtFlow
                        </Link>
                        <p className="mt-4 text-muted-foreground max-w-xs">
                            Empowering sports communities with professional tournament management tools. Organize, compete, and grow.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-red-500">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/events" className="text-muted-foreground hover:text-accent transition">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-accent transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <a href="https://drive.google.com/file/d/1pMMS2Oezzi9IuS900d02C9Azqua7uQ4Z/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition">
                                    Demo
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-red-500">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-accent transition">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-accent transition">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-accent transition">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://github.com/Ansukr07/Tournament-System" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent transition">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} CourtFlow. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
