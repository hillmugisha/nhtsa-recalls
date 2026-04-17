'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Recall } from '@/lib/types'
import RecallDetailModal from './RecallDetailModal'

interface Props {
  recalls: Recall[]
}

const COLUMNS = [
  { key: 'details',                  label: 'DETAILS',       defaultWidth: 80  },
  { key: 'campno',                   label: 'NHTSA #',       defaultWidth: 120 },
  { key: 'make',                     label: 'Make',          defaultWidth: 110 },
  { key: 'model',                    label: 'Model',         defaultWidth: 130 },
  { key: 'model_year',               label: 'Year',          defaultWidth: 70  },
  { key: 'component_name',           label: 'Component',     defaultWidth: 160 },
  { key: 'manufacturer_name',        label: 'Manufacturer',  defaultWidth: 150 },
  { key: 'defect_description',       label: 'Defect Summary',defaultWidth: 220 },
  { key: 'potential_units_affected', label: 'Units Affected',defaultWidth: 120 },
  { key: 'report_received_date',     label: 'Report Date',   defaultWidth: 110 },
  { key: 'do_not_drive',             label: 'Do Not Drive',  defaultWidth: 110 },
]

export default function RecallsTable({ recalls }: Props) {
  const [selected, setSelected] = useState<Recall | null>(null)
  const [colWidths, setColWidths] = useState<number[]>(COLUMNS.map(c => c.defaultWidth))
  const dragging = useRef<{ colIndex: number; startX: number; startWidth: number } | null>(null)

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

  if (recalls.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No recalls found. Adjust your filters or sync the latest data.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: colWidths.reduce((a, b) => a + b, 0) }}>
          <colgroup>
            {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 bg-gray-50">
              {COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  className="relative px-3 py-3 overflow-hidden whitespace-nowrap select-none"
                  style={{ width: colWidths[i] }}
                >
                  <span className="truncate block pr-2">{col.label}</span>
                  {i < COLUMNS.length - 1 && (
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
            {recalls.map(r => (
              <tr
                key={r.id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
              >
                {/* Details button */}
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => setSelected(r)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-[#1B2A4A] hover:bg-blue-100 transition-colors"
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
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
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <RecallDetailModal recall={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
