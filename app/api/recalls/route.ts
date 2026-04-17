import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const make      = searchParams.get('make')
  const model     = searchParams.get('model')
  const modelYear = searchParams.get('modelYear')
  const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase.from('recalls').select('*', { count: 'exact' })

  if (make)      query = query.ilike('make', make)
  if (model)     query = query.ilike('model', model)
  if (modelYear) query = query.eq('model_year', parseInt(modelYear, 10))

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const { data, count, error } = await query
    .order('report_received_date', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}
