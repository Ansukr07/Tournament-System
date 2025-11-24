"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    setMobileMenuOpen(false)
    router.push("/")
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-13 h-13 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo2.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span>CourtFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
                Home
              </Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition">
                Events
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
                About Us
              </Link>
              <a href="https://drive.google.com/file/d/1el5E2oQJdWjqxz48PGMcSy7PP_sD85bY/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition">
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

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex gap-2">
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

            {/* Mobile Menu Button - Circular Ring */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-12 h-12 rounded-full border-2 border-accent bg-background/80 flex items-center justify-center hover:bg-accent/10 transition-all duration-200 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Popup */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Menu Content */}
        <div
          className={`absolute top-20 right-4 w-64 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
        >
          <div className="p-6 space-y-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block text-base text-muted-foreground hover:text-foreground transition py-2"
            >
              Home
            </Link>
            <Link
              href="/events"
              onClick={closeMobileMenu}
              className="block text-base text-muted-foreground hover:text-foreground transition py-2"
            >
              Events
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="block text-base text-muted-foreground hover:text-foreground transition py-2"
            >
              About Us
            </Link>
            <a
              href="https://drive.google.com/file/d/1el5E2oQJdWjqxz48PGMcSy7PP_sD85bY/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="block text-base text-muted-foreground hover:text-foreground transition py-2"
            >
              Demo
            </a>

            {token && role === "umpire" && (
              <Link
                href="/umpire"
                onClick={closeMobileMenu}
                className="block text-base text-muted-foreground hover:text-foreground transition py-2"
              >
                Umpire Dashboard
              </Link>
            )}

            {token && role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={closeMobileMenu}
                className="block text-base text-muted-foreground hover:text-foreground transition py-2"
              >
                Admin Dashboard
              </Link>
            )}

            {token && role !== "admin" && role !== "umpire" && (
              <Link
                href="/leaderboard"
                onClick={closeMobileMenu}
                className="block text-base text-muted-foreground hover:text-foreground transition py-2"
              >
                Leaderboard
              </Link>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              {token ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full">
                    <Link href="/auth/login" onClick={closeMobileMenu} className="w-full">
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-accent w-full">
                    <Link href="/auth/register" onClick={closeMobileMenu} className="w-full">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
