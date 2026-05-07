export type FilterState = {
  platforms: Set<string>
  statuses: Set<string>
  spendMin?: number
  spendMax?: number
  ctrMin?: number
  ctrMax?: number
  impressionsMin?: number
  impressionsMax?: number
  creativeType: 'any' | 'image' | 'video'
  dateRangeDays: number
}

export function normalizeMetrics(ad: any): {
  impressions: number | null
  clicks: number | null
  spend: number | null
  ctr: number | null
  hasMetrics: boolean
  creativeType: 'image' | 'video' | 'unknown'
}

export function applyFilters(ads: any[], filters: FilterState): any[]

export function serializeFilters(filters: FilterState): string

export function parseFilters(queryString: string): FilterState
