'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'

const navItems = [
  { href: '/', label: 'Assignment 1' },
  { href: '/assignment-2', label: 'Assignment 2' },
  { href: '/assignment-3', label: 'Assignments 3 & 4' },
  { href: '/assignment-5', label: 'Assignment 5' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <span className="sidebar-mobile-toggle-icon" aria-hidden="true">
          {mobileOpen ? '\u2715' : '\u2630'}
        </span>
        <span className="sidebar-mobile-toggle-label">
          {mobileOpen ? 'Close' : 'Menu'}
        </span>
      </button>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        <h1 className="sidebar-brand">Alexa Kafka's </h1>
        <h2 className="sidebar-subtitle">Humor Project</h2>
        <nav className="sidebar-nav">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <UserMenu />
      </aside>
    </>
  )
}
