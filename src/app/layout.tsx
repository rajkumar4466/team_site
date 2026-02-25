import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'KKR — Kolkata Knight Riders',
  description: 'Your home for KKR squad profiles, season stats, and player action photography.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="bg-kkr-purple-dark text-white/60 text-center py-6 text-sm mt-16">
          <p>Kolkata Knight Riders Fan Site &copy; {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs">This is an unofficial fan site. Not affiliated with KKR or the BCCI.</p>
        </footer>
      </body>
    </html>
  )
}
