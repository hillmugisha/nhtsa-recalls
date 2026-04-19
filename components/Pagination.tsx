interface Props {
  page: number
  totalPages: number
  count: number
  pageSize?: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, count, pageSize = 50, onPageChange }: Props) {
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, count)

  // Show up to 5 page numbers around current page
  const pageNumbers: number[] = []
  const start = Math.max(1, page - 2)
  const end   = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pageNumbers.push(i)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-white text-sm">
      <span className="text-gray-500 text-xs sm:text-sm">
        Showing {from}–{to} of {count.toLocaleString()} recalls
      </span>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ← Prev
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50">1</button>
            {start > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pageNumbers.map(n => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
              n === page
                ? 'text-white border-transparent'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            style={n === page ? { backgroundColor: 'var(--navy)', borderColor: 'var(--navy)' } : {}}
          >
            {n}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
