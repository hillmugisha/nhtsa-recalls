'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import RecallsTable from '@/components/RecallsTable'
import Pagination from '@/components/Pagination'
import Spinner from '@/components/Spinner'
import { Recall } from '@/lib/types'

interface Filters {
  modelYear: string
  make: string
  model: string
}

export default function HomePage() {
  const [filters, setFilters]       = useState<Filters>({ modelYear: '', make: '', model: '' })
  const [recalls, setRecalls]       = useState<Recall[]>([])
  const [count, setCount]           = useState(0)
  const [totalPages, setTotal]      = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchRecalls = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (f.modelYear) params.set('modelYear', f.modelYear)
    if (f.make)      params.set('make', f.make)
    if (f.model)     params.set('model', f.model)

    try {
      const res  = await fetch(`/api/recalls?${params}`)
      const data = await res.json()
      setRecalls(data.data ?? [])
      setCount(data.count ?? 0)
      setTotal(data.totalPages ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecalls({ modelYear: '', make: '', model: '' }, 1) }, [fetchRecalls])

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
    fetchRecalls(newFilters, 1)
    setSidebarOpen(false)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchRecalls(filters, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFilterCount = [filters.modelYear, filters.make, filters.model].filter(Boolean).length

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar
        onSearch={handleSearch}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              <Spinner className="h-5 w-5 mr-2 text-[#1B2A4A]" />
              Loading recalls...
            </div>
          ) : (
            <RecallsTable recalls={recalls} filters={filters} count={count} />
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            count={count}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}
