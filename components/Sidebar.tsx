'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Assignment 1' },
  { href: '/assignment-2', label: 'Assignment 2' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
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
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
