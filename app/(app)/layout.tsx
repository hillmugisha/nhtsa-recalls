export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnnouncementBanner from '@/components/AnnouncementBanner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 min-w-max">
      <AnnouncementBanner />
      <Header />
      <main className="flex flex-1 min-h-0">{children}</main>
      <Footer />
    </div>
  )
}
