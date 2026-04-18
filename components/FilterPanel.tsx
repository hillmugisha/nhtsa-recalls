'use client'

import { useEffect, useState } from 'react'

interface Props {
  onSearch: (filters: { modelYear: string; make: string; model: string }) => void
}

export default function FilterPanel({ onSearch }: Props) {
  const [years, setYears]   = useState<number[]>([])
  const [makes, setMakes]   = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])

  const [selectedYear,  setSelectedYear]  = useState('')
  const [selectedMake,  setSelectedMake]  = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    fetch('/api/filters')
      .then(r => r.json())
      .then(d => setYears(d.years ?? []))
  }, [])

  useEffect(() => {
    if (!selectedYear) { setMakes([]); setSelectedMake(''); return }
    fetch(`/api/filters?modelYear=${selectedYear}`)
      .then(r => r.json())
      .then(d => { setMakes(d.makes ?? []); setSelectedMake(''); setModels([]); setSelectedModel('') })
  }, [selectedYear])

  useEffect(() => {
    if (!selectedMake) { setModels([]); setSelectedModel(''); return }
    fetch(`/api/filters?modelYear=${selectedYear}&make=${encodeURIComponent(selectedMake)}`)
      .then(r => r.json())
      .then(d => { setModels(d.models ?? []); setSelectedModel('') })
  }, [selectedMake, selectedYear])

  const handleSearch = () => {
    onSearch({ modelYear: selectedYear, make: selectedMake, model: selectedModel })
  }

  const handleClear = () => {
    setSelectedYear(''); setSelectedMake(''); setSelectedModel('')
    onSearch({ modelYear: '', make: '', model: '' })
  }

  const selectClass =
    'w-full rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer'

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-white text-base tracking-wide">Filters</h2>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-300 tracking-wide">Year</label>
        <div className="relative">
          <select
            className={selectClass}
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-300 tracking-wide">Make</label>
        <div className="relative">
          <select
            className={selectClass}
            value={selectedMake}
            onChange={e => setSelectedMake(e.target.value)}
            disabled={!selectedYear}
          >
            <option value="">All</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-300 tracking-wide">Model</label>
        <div className="relative">
          <select
            className={selectClass}
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={!selectedMake}
          >
            <option value="">All</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronIcon />
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <button
          onClick={handleSearch}
          className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          Search
        </button>
        {(selectedYear || selectedMake || selectedModel) && (
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  )
}
