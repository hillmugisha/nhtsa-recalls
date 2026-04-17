'use client'

import { Recall } from '@/lib/types'
import * as XLSX from 'xlsx'

interface Props {
  filters: { modelYear: string; make: string; model: string }
}

export default function ExportButton({ filters }: Props) {
  const handleExport = async () => {
    const params = new URLSearchParams()
    if (filters.modelYear) params.set('modelYear', filters.modelYear)
    if (filters.make)      params.set('make', filters.make)
    if (filters.model)     params.set('model', filters.model)
    params.set('pageSize', '10000') // large page to get all results

    // Fetch all matching records
    const res  = await fetch(`/api/recalls?${params}&page=1`)
    const data = await res.json()
    const recalls: Recall[] = data.data ?? []

    const rows = recalls.map(r => ({
      'NHTSA #':          r.campno,
      'Make':             r.make,
      'Model':            r.model,
      'Year':             r.model_year,
      'Component':        r.component_name,
      'Manufacturer':     r.manufacturer_name,
      'Recall Type':      r.recall_type,
      'Units Affected':   r.potential_units_affected,
      'Report Date':      r.report_received_date,
      'Notification Date':r.owner_notification_date,
      'Influenced By':    r.influenced_by,
      'Defect':           r.defect_description,
      'Consequence':      r.consequence_description,
      'Corrective Action':r.corrective_action,
      'Notes':            r.notes,
      'Do Not Drive':     r.do_not_drive ? 'Yes' : '',
      'Park Outside':     r.park_outside ? 'Yes' : '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Recalls')
    XLSX.writeFile(wb, `NHTSA_Recalls_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
      style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #22863a 100%)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      Export to Excel
    </button>
  )
}
