export interface Recall {
  id: number
  campno: string
  make: string | null
  model: string | null
  model_year: number | null
  mfg_campaign_no: string | null
  component_name: string | null
  manufacturer_name: string | null
  recall_type: string | null
  potential_units_affected: number | null
  owner_notification_date: string | null
  influenced_by: string | null
  report_received_date: string | null
  defect_description: string | null
  consequence_description: string | null
  corrective_action: string | null
  notes: string | null
  do_not_drive: boolean | null
  park_outside: boolean | null
  synced_at: string | null
}

export interface RecallsResponse {
  data: Recall[]
  count: number
  totalPages: number
}

export interface FiltersResponse {
  years: number[]
  makes: string[]
  models: string[]
}

export interface SyncResponse {
  status: 'success' | 'error'
  message: string
  recordsUpserted?: number
}

// Raw shape returned by NHTSA recallsByVehicle endpoint
export interface NHTSARecall {
  NHTSACampaignNumber: string
  ReportReceivedDate: string
  Component: string
  Summary: string
  Consequence: string
  Remedy: string
  Notes: string
  ModelYear: string
  Make: string
  Model: string
  Manufacturer?: string
  OwnerNotificationDate?: string
  RecallType?: string
  parkIt?: boolean
  parkOutSide?: boolean
  MfgCampaignNumber?: string
  InfluencedBy?: string
}
