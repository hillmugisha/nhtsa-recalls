import FilterPanel from './FilterPanel'
import SidebarUserInfo from './SidebarUserInfo'

interface Props {
  onSearch: (filters: { modelYear: string; make: string; model: string }) => void
}

export default function Sidebar({ onSearch }: Props) {
  return (
    <aside className="w-64 shrink-0 p-5 flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="flex-1 min-h-0">
        <FilterPanel onSearch={onSearch} />
      </div>
      <SidebarUserInfo />
    </aside>
  )
}
