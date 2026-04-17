'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import RecallsTable from '@/components/RecallsTable'
import Pagination from '@/components/Pagination'
import ExportButton from '@/components/ExportButton'
import { Recall } from '@/lib/types'

interface Filters {
  modelYear: string
  make: string
  model: string
}

export default function HomePage() {
  const [filters, setFilters]   = useState<Filters>({ modelYear: '', make: '', model: '' })
  const [recalls, setRecalls]   = useState<Recall[]>([])
  const [count, setCount]       = useState(0)
  const [totalPages, setTotal]  = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)

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
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchRecalls(filters, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar onSearch={handleSearch} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            {loading ? 'Loading...' : `${count.toLocaleString()} Recall${count !== 1 ? 's' : ''} Found`}
          </h2>
          <ExportButton filters={filters} />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              <svg className="animate-spin h-5 w-5 mr-2 text-[#1B2A4A]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading recalls...
            </div>
          ) : (
            <RecallsTable recalls={recalls} />
          )}
        </div>

        {/* Pagination */}
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
