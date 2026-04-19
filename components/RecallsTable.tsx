'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Recall } from '@/lib/types'
import RecallDetailModal from './RecallDetailModal'
import ExportButton from './ExportButton'

interface Props {
  recalls: Recall[]
  filters: { modelYear: string; make: string; model: string }
  count: number
}

const DATA_COLUMNS = [
  { key: 'campno',                   label: 'NHTSA #',        defaultWidth: 120 },
  { key: 'make',                     label: 'Make',           defaultWidth: 110 },
  { key: 'model',                    label: 'Model',          defaultWidth: 130 },
  { key: 'model_year',               label: 'Year',           defaultWidth: 70  },
  { key: 'component_name',           label: 'Component',      defaultWidth: 160 },
  { key: 'manufacturer_name',        label: 'Manufacturer',   defaultWidth: 150 },
  { key: 'defect_description',       label: 'Defect Summary', defaultWidth: 220 },
  { key: 'potential_units_affected', label: 'Units Affected', defaultWidth: 120 },
  { key: 'report_received_date',     label: 'Report Date',    defaultWidth: 110 },
  { key: 'do_not_drive',             label: 'Do Not Drive',   defaultWidth: 110 },
]

// Fixed widths for non-resizable columns
const CHECKBOX_WIDTH = 48
const DETAILS_WIDTH  = 64

export default function RecallsTable({ recalls, filters, count }: Props) {
  const [selected, setSelected]     = useState<Recall | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [colWidths, setColWidths]   = useState<number[]>(DATA_COLUMNS.map(c => c.defaultWidth))
  const dragging = useRef<{ colIndex: number; startX: number; startWidth: number } | null>(null)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  const allSelected  = recalls.length > 0 && recalls.every(r => selectedIds.has(r.id))
  const someSelected = recalls.some(r => selectedIds.has(r.id)) && !allSelected

  // Reset selection when recalls list changes
  useEffect(() => { setSelectedIds(new Set()) }, [recalls])

  // Sync indeterminate state on header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(recalls.map(r => r.id)))
  }

  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const onMouseDown = useCallback((e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    dragging.current = { colIndex, startX: e.clientX, startWidth: colWidths[colIndex] }

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = ev.clientX - dragging.current.startX
      const newWidth = Math.max(40, dragging.current.startWidth + delta)
      setColWidths(prev => {
        const next = [...prev]
        next[dragging.current!.colIndex] = newWidth
        return next
      })
    }

    const onMouseUp = () => {
      dragging.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [colWidths])

  const totalWidth     = CHECKBOX_WIDTH + DETAILS_WIDTH + colWidths.reduce((a, b) => a + b, 0)
  const selectedRecalls = recalls.filter(r => selectedIds.has(r.id))

  return (
    <>
      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 min-w-0 truncate">
          {count.toLocaleString()} Recall{count !== 1 ? 's' : ''} Found
        </h2>
        <div className="shrink-0">
          <ExportButton filters={filters} selectedRecalls={selectedRecalls} totalCount={count} />
        </div>
      </div>

      {recalls.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No recalls found. Adjust your filters or sync the latest data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="text-sm border-collapse"
            style={{ tableLayout: 'fixed', width: totalWidth }}
          >
            <colgroup>
              <col style={{ width: CHECKBOX_WIDTH }} />
              <col style={{ width: DETAILS_WIDTH }} />
              {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <thead>
              <tr className="text-left bg-white border-b-2 border-gray-200">
                {/* Select-all checkbox */}
                <th className="px-3 py-3 text-center">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-[#1B2A4A]"
                    aria-label="Select all"
                  />
                </th>

                {/* Details column header */}
                <th className="px-3 py-3 text-xs font-bold tracking-wider select-none whitespace-nowrap overflow-hidden" style={{ color: '#1B2A4A' }}>
                  DETAILS
                </th>

                {/* Data column headers */}
                {DATA_COLUMNS.map((col, i) => (
                  <th
                    key={col.key}
                    className="relative px-3 py-3 text-xs font-bold tracking-wider overflow-hidden whitespace-nowrap select-none"
                    style={{ width: colWidths[i], color: '#1B2A4A' }}
                  >
                    <span className="truncate block pr-2">{col.label}</span>
                    {i < DATA_COLUMNS.length - 1 && (
                      <div
                        onMouseDown={e => onMouseDown(e, i)}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
                      >
                        <div className="w-px h-4 bg-gray-300 group-hover:bg-blue-400 transition-colors" />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recalls.map(r => {
                const isChecked = selectedIds.has(r.id)
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 transition-colors ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Row checkbox */}
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRow(r.id)}
                        className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-[#1B2A4A]"
                        aria-label={`Select recall ${r.campno}`}
                      />
                    </td>

                    {/* Details eye button */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        title="View details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>

                    <td className="px-3 py-3 font-mono text-xs text-blue-700 overflow-hidden truncate">{r.campno}</td>
                    <td className="px-3 py-3 font-medium overflow-hidden truncate">{r.make ?? '—'}</td>
                    <td className="px-3 py-3 overflow-hidden truncate">{r.model ?? '—'}</td>
                    <td className="px-3 py-3">{r.model_year ?? '—'}</td>
                    <td className="px-3 py-3 overflow-hidden truncate" title={r.component_name ?? ''}>{r.component_name ?? '—'}</td>
                    <td className="px-3 py-3 overflow-hidden truncate" title={r.manufacturer_name ?? ''}>{r.manufacturer_name ?? '—'}</td>
                    <td className="px-3 py-3 overflow-hidden truncate" title={r.defect_description ?? ''}>{r.defect_description ?? '—'}</td>
                    <td className="px-3 py-3 text-right overflow-hidden truncate">{r.potential_units_affected?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-3 overflow-hidden truncate">{r.report_received_date ?? '—'}</td>
                    <td className="px-3 py-3 text-center">
                      {r.do_not_drive
                        ? <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">YES</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <RecallDetailModal recall={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
