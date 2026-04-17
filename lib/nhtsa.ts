import axios from 'axios'
import { NHTSARecall } from './types'

const BASE = 'https://api.nhtsa.gov'
const DELAY_MS = 150

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function safeGet<T>(url: string, params: Record<string, unknown>): Promise<T[]> {
  await sleep(DELAY_MS)
  try {
    const res = await axios.get(url, { params })
    return res.data?.results ?? []
  } catch {
    return []
  }
}

export async function getModelYears(): Promise<number[]> {
  const results: { modelYear: string }[] = await safeGet(`${BASE}/products/vehicle/modelYears`, { issueType: 'r' })
  return results
    .map(r => parseInt(r.modelYear, 10))
    .filter(y => !isNaN(y) && y >= 2024 && y !== 9999)
    .sort((a, b) => b - a)
}

export async function getMakesForYear(modelYear: number): Promise<string[]> {
  const results: { make: string }[] = await safeGet(`${BASE}/products/vehicle/makes`, { modelYear, issueType: 'r' })
  return results.map(r => r.make)
}

export async function getModelsForYearMake(modelYear: number, make: string): Promise<string[]> {
  const results: { model: string }[] = await safeGet(`${BASE}/products/vehicle/models`, { modelYear, make, issueType: 'r' })
  return results.map(r => r.model)
}

export async function getRecallsForVehicle(
  modelYear: number,
  make: string,
  model: string
): Promise<NHTSARecall[]> {
  return safeGet(`${BASE}/recalls/recallsByVehicle`, { make, model, modelYear })
}
