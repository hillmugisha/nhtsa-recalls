import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_MAKES = ['CHEVROLET', 'CHRYSLER', 'DODGE', 'FORD', 'GM', 'ISUZU', 'JEEP', 'NISSAN', 'RAM', 'VOLKSWAGEN']

async function main() {
  // Preview what will be deleted
  const { data: before } = await supabase.from('recalls').select('make').not('make', 'is', null)
  const allMakes = [...new Set((before ?? []).map(r => (r.make as string).toUpperCase()))].sort()
  const toDelete = allMakes.filter(m => !ALLOWED_MAKES.includes(m))

  console.log('Makes to delete:', toDelete)

  if (toDelete.length === 0) {
    console.log('Nothing to clean up.')
    return
  }

  const { error, count } = await supabase
    .from('recalls')
    .delete({ count: 'exact' })
    .not('make', 'is', null)
    .filter('make', 'not.in', `(${ALLOWED_MAKES.map(m => `"${m}"`).join(',')})`)

  if (error) {
    console.error('Delete error:', error.message)
  } else {
    console.log(`Deleted ${count} records with non-allowed makes.`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
