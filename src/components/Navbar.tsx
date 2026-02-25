'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/players', label: 'Players' },
  { href: '/stats', label: 'Stats' },
  { href: '/gallery', label: 'Gallery' },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-kkr-purple text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-kkr-gold font-extrabold text-2xl tracking-wider">KKR</span>
            <span className="hidden sm:block text-white text-sm font-medium opacity-80">
              Kolkata Knight Riders
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-150
                  ${pathname.startsWith(link.href)
                    ? 'text-kkr-gold border-b-2 border-kkr-gold pb-0.5'
                    : 'text-white hover:text-kkr-gold'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-white hover:text-kkr-gold focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
            <div className="w-6 h-0.5 bg-current"></div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-kkr-purple-dark border-t border-kkr-gold/20">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-3 text-sm font-semibold uppercase tracking-wide
                ${pathname.startsWith(link.href)
                  ? 'text-kkr-gold bg-kkr-purple/50'
                  : 'text-white hover:text-kkr-gold hover:bg-kkr-purple/30'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
