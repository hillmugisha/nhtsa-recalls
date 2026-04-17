import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    // Fix known exceptions
    .replace(/\bGm\b/g, 'GM')
    .replace(/\bNhtsa\b/g, 'NHTSA')
}

async function main() {
  const { data, error } = await supabase.from('recalls').select('id, make, model')
  if (error) { console.error(error.message); process.exit(1) }

  console.log(`Normalizing ${data.length} records...`)
  let updated = 0

  for (const row of data) {
    const newMake  = row.make  ? toTitleCase(row.make)  : row.make
    const newModel = row.model ? toTitleCase(row.model) : row.model

    if (newMake !== row.make || newModel !== row.model) {
      const { error: updateError } = await supabase
        .from('recalls')
        .update({ make: newMake, model: newModel })
        .eq('id', row.id)

      if (updateError) {
        console.error(`Failed to update id ${row.id}:`, updateError.message)
      } else {
        updated++
      }
    }
  }

  console.log(`Done. Updated ${updated} records.`)
}

main().catch(err => { console.error(err); process.exit(1) })
