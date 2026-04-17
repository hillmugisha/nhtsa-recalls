import FilterPanel from './FilterPanel'

interface Props {
  onSearch: (filters: { modelYear: string; make: string; model: string }) => void
}

export default function Sidebar({ onSearch }: Props) {
  return (
    <aside className="w-64 shrink-0 p-5 flex flex-col min-h-full" style={{ backgroundColor: '#1a1a1a' }}>
      <FilterPanel onSearch={onSearch} />
    </aside>
  )
}
