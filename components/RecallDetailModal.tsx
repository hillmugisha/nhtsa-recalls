'use client'

import { useEffect } from 'react'
import { Recall } from '@/lib/types'

interface Props {
  recall: Recall
  onClose: () => void
}

export default function RecallDetailModal({ recall, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const Section = ({ title, content }: { title: string; content: string | null }) => {
    if (!content) return null
    return (
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                {recall.campno}
              </span>
              {recall.do_not_drive && (
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  DO NOT DRIVE
                </span>
              )}
              {recall.park_outside && (
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                  PARK OUTSIDE
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {[recall.model_year, recall.make, recall.model].filter(Boolean).join(' ')}
            </h2>
            {recall.component_name && (
              <p className="text-sm text-gray-500 mt-0.5">Component: {recall.component_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4 mt-0.5"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="flex gap-6 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
          {recall.manufacturer_name && <span><span className="font-medium text-gray-600">Manufacturer:</span> {recall.manufacturer_name}</span>}
          {recall.report_received_date && <span><span className="font-medium text-gray-600">Report Date:</span> {recall.report_received_date}</span>}
          {recall.potential_units_affected && <span><span className="font-medium text-gray-600">Units Affected:</span> {recall.potential_units_affected.toLocaleString()}</span>}
          {recall.influenced_by && <span><span className="font-medium text-gray-600">Initiated By:</span> {recall.influenced_by}</span>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Section title="Defect Description" content={recall.defect_description} />
          <Section title="Consequence" content={recall.consequence_description} />
          <Section title="Corrective Action" content={recall.corrective_action} />
          <Section title="Notes" content={recall.notes} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
