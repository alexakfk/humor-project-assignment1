import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project 1 - Alexa Kafka',
  description: 'A basic Next.js application by Alexa Kafka',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
