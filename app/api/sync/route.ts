import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getModelYears, getMakesForYear, getModelsForYearMake, getRecallsForVehicle } from '@/lib/nhtsa'
import { NHTSARecall } from '@/lib/types'

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bGm\b/g, 'GM')
    .replace(/\bNhtsa\b/g, 'NHTSA')
}

function parseDate(raw: string | undefined): string | null {
  if (!raw) return null
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

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const years = await getModelYears()
    let totalUpserted = 0

    for (const year of years) {
      const makes = await getMakesForYear(year)

      for (const make of makes) {
        const models = await getModelsForYearMake(year, make)

        for (const model of models) {
          try {
            const recalls = await getRecallsForVehicle(year, make, model)
            if (recalls.length === 0) continue

            const rows = recalls.map(mapRecall)
            const { error } = await supabase.from('recalls').upsert(rows, { onConflict: 'campno' })
            if (!error) totalUpserted += rows.length
          } catch {
            // Skip individual failures and continue
          }
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Sync complete for years: ${years.join(', ')}`,
      recordsUpserted: totalUpserted,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
