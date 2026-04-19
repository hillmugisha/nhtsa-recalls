/**
 * Manual sync script — run with: npx tsx scripts/sync-recalls.ts
 * Fetches all NHTSA recalls for 2024-present and upserts into Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import { getModelYears, getMakesForYear, getModelsForYearMake, getRecallsForVehicle } from '../lib/nhtsa'
import { NHTSARecall } from '../lib/types'

// Load env from .env.local when running as a script
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
    .replace(/\bGm\b/g, 'GM')
    .replace(/\bNhtsa\b/g, 'NHTSA')
    .replace(/\bEv\b/g, 'EV')
}

function parseDate(raw: string | undefined): string | null {
  if (!raw) return null
  // NHTSA returns dates like "20220315T000000" or ISO strings
  const cleaned = raw.replace('T000000', '')
  if (/^\d{8}$/.test(cleaned)) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`
  }
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
}

function mapRecall(r: NHTSARecall) {
  return {
    campno:                   r.NHTSACampaignNumber,
    make:                     r.Make ? toTitleCase(r.Make) : null,
    model:                    r.Model ? toTitleCase(r.Model) : null,
    model_year:               r.ModelYear ? parseInt(r.ModelYear, 10) : null,
    mfg_campaign_no:          r.MfgCampaignNumber ?? null,
    component_name:           r.Component ?? null,
    manufacturer_name:        r.Manufacturer ?? null,
    recall_type:              r.RecallType ?? null,
    potential_units_affected: r.PotentialNumberofUnitsAffected ?? null,
    owner_notification_date:  parseDate(r.OwnerNotificationDate),
    influenced_by:            r.InfluencedBy ?? null,
    report_received_date:     parseDate(r.ReportReceivedDate),
    defect_description:       r.Summary ?? null,
    consequence_description:  r.Consequence ?? null,
    corrective_action:        r.Remedy ?? null,
    notes:                    r.Notes ?? null,
    do_not_drive:             r.DoNotDriveAdvisory ?? null,
    park_outside:             r.ParkOutsideAdvisory ?? null,
    synced_at:                new Date().toISOString(),
  }
}

async function main() {
  console.log('Fetching model years (2024–present)...')
  const years = await getModelYears()
  console.log(`Years to sync: ${years.join(', ')}`)

  let totalUpserted = 0

  const ALLOWED_MAKES = new Set([
    'CHEVROLET', 'CHRYSLER', 'DODGE', 'FORD', 'GM',
    'ISUZU', 'JEEP', 'NISSAN', 'RAM', 'VOLKSWAGEN',
  ])

  for (const year of years) {
    console.log(`\n[${year}] Fetching makes...`)
    const allMakes = await getMakesForYear(year)
    const makes = allMakes.filter(m => ALLOWED_MAKES.has(m.toUpperCase()))
    console.log(`[${year}] ${makes.length} matching makes found (filtered from ${allMakes.length})`)

    for (const make of makes) {
      // getModelsForYearMake already returns [] on API errors (e.g. 500 for bad make values)
      const models = await getModelsForYearMake(year, make)
      if (models.length === 0) continue

      for (const model of models) {
        const recalls = await getRecallsForVehicle(year, make, model)
        if (recalls.length === 0) continue

        const rows = recalls.map(mapRecall)

        const { error } = await supabase
          .from('recalls')
          .upsert(rows, { onConflict: 'campno' })

        if (error) {
          console.error(`  Error upserting ${year}/${make}/${model}:`, error.message)
        } else {
          totalUpserted += rows.length
          console.log(`  ✓ ${year} ${make} ${model}: ${rows.length} recall(s)`)
        }
      }
    }
  }

  console.log(`\nSync complete. Total records upserted: ${totalUpserted}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
