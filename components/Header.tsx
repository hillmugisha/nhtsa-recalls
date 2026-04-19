import Link from 'next/link'
import Image from 'next/image'

const NHTSA_URL =
  'https://www.nhtsa.gov/recalls?utm_source=google&utm_medium=search&utm_campaign=safecarssavelives2025-2026&gad_source=1&gad_campaignid=23383552240&gbraid=0AAAAAoa-qF2sKHJK44pmW2d2OilwXsexB&gclid=Cj0KCQiAvtzLBhCPARIsALwhxdoxb3IkUYslqXfAgtghSU607l4uxerX7dTlN20wq2p4VChi5XI5wQIaAguqEALw_wcB'

export default function Header() {
  return (
    <header className="flex items-center px-4 sm:px-6 py-1.5 shadow-md" style={{ backgroundColor: 'var(--navy)' }}>
      {/* Logo */}
      <div className="shrink-0 mr-3">
        <Image
          src="/logo.png"
          alt="Pritchard Commercial"
          width={48}
          height={48}
          className="object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
          priority
        />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0 text-center px-2">
        <h1 className="text-white font-bold text-base sm:text-xl tracking-wide truncate">NHTSA Vehicle Recalls</h1>
      </div>

      {/* Nav */}
      <nav className="shrink-0 flex items-center">
        <Link
          href={NHTSA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 sm:px-4 py-1.5 rounded border border-white text-white text-xs sm:text-sm font-medium hover:bg-white hover:text-[#1B2A4A] transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">NHTSA - </span>Recalls
        </Link>
      </nav>
    </header>
  )
}
