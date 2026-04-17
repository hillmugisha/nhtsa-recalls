import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const modelYear = searchParams.get('modelYear')
  const make      = searchParams.get('make')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Always return all available years
  const { data: yearRows } = await supabase
    .from('recalls')
    .select('model_year')
    .not('model_year', 'is', null)
    .order('model_year', { ascending: false })

  const years = [...new Set((yearRows ?? []).map(r => r.model_year as number))].sort((a, b) => b - a)

  // Makes filtered by year if provided
  let makesQuery = supabase.from('recalls').select('make').not('make', 'is', null)
  if (modelYear) makesQuery = makesQuery.eq('model_year', parseInt(modelYear, 10))
  const { data: makeRows } = await makesQuery

  const makes = [...new Set((makeRows ?? []).map(r => r.make as string))].sort()

  // Models filtered by year+make if provided
  let modelsQuery = supabase.from('recalls').select('model').not('model', 'is', null)
  if (modelYear) modelsQuery = modelsQuery.eq('model_year', parseInt(modelYear, 10))
  if (make)      modelsQuery = modelsQuery.ilike('make', make)
  const { data: modelRows } = await modelsQuery

  const models = [...new Set((modelRows ?? []).map(r => r.model as string))].sort()

  return NextResponse.json({ years, makes, models })
}
