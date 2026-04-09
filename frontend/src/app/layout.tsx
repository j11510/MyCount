import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyCount - Premium Expense Tracker',
  description: 'Track your monthly outgoings with rich aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
