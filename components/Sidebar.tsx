'use client'

import FilterPanel from './FilterPanel'
import SidebarUserInfo from './SidebarUserInfo'

interface Props {
  onSearch: (filters: { modelYear: string; make: string; model: string }) => void
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ onSearch, isOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 p-5 flex flex-col overflow-y-auto transition-transform duration-300',
          'md:relative md:inset-auto md:z-auto md:h-full md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {/* Mobile header row with close button */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <span className="text-white font-semibold text-sm tracking-wide">Filters</span>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
            aria-label="Close filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <FilterPanel onSearch={onSearch} />
        </div>
        <SidebarUserInfo />
      </aside>
    </>
  )
}
