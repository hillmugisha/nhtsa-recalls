'use client'

import { useState } from 'react'
import { Recall } from '@/lib/types'
import * as XLSX from 'xlsx'
import Spinner from './Spinner'

const GREEN = '#1B6B3A'

interface Props {
  filters: { modelYear: string; make: string; model: string }
  selectedRecalls: Recall[]
  totalCount: number
}

function toRows(recalls: Recall[]) {
  return recalls.map(r => ({
    'NHTSA #':           r.campno,
    'Make':              r.make,
    'Model':             r.model,
    'Year':              r.model_year,
    'Component':         r.component_name,
    'Manufacturer':      r.manufacturer_name,
    'Recall Type':       r.recall_type,
    'Units Affected':    r.potential_units_affected,
    'Report Date':       r.report_received_date,
    'Notification Date': r.owner_notification_date,
    'Influenced By':     r.influenced_by,
    'Defect':            r.defect_description,
    'Consequence':       r.consequence_description,
    'Corrective Action': r.corrective_action,
    'Notes':             r.notes,
    'Do Not Drive':      r.do_not_drive ? 'Yes' : '',
    'Park Outside':      r.park_outside ? 'Yes' : '',
  }))
}

function writeExcel(recalls: Recall[]) {
  const ws = XLSX.utils.json_to_sheet(toRows(recalls))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Recalls')
  XLSX.writeFile(wb, `NHTSA_Recalls_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export default function ExportButton({ filters, selectedRecalls, totalCount }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)

  const handleClick = () => {
    if (selectedRecalls.length > 0) {
      writeExcel(selectedRecalls)
    } else {
      setShowConfirm(true)
    }
  }

  const handleExportAll = async () => {
    setShowConfirm(false)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.modelYear) params.set('modelYear', filters.modelYear)
      if (filters.make)      params.set('make', filters.make)
      if (filters.model)     params.set('model', filters.model)
      params.set('pageSize', '10000')
      const res  = await fetch(`/api/recalls?${params}&page=1`)
      const data = await res.json()
      writeExcel(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const label = loading
    ? 'Exporting…'
    : selectedRecalls.length > 0
      ? `Export ${selectedRecalls.length} Selected`
      : 'Export to Excel'

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #22863a 100%)` }}
      >
        {loading ? (
          <Spinner />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
        {label}
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Export all recalls?</h3>
              <p className="text-sm text-gray-500">
                No rows are selected. Do you want to export all{' '}
                <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span>{' '}
                matching recall{totalCount !== 1 ? 's' : ''}?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExportAll}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: GREEN }}
              >
                Export All {totalCount.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
