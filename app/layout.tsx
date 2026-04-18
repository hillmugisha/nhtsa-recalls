import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NHTSA Vehicle Recalls | Pritchard Commercial',
  description: 'Search NHTSA vehicle recall data by make, model, and year.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
