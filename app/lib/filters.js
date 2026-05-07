function normalizeMetrics(ad) {
  const insights = ad.insights?.data?.[0] || {}
  const impressions = insights.impressions != null ? Number(insights.impressions) : null
  const clicks = insights.clicks != null ? Number(insights.clicks) : null
  const spend = insights.spend != null ? Number(insights.spend) : null
  const ctr = insights.ctr != null ? Number(insights.ctr) : null
  const hasMetrics = [impressions, clicks, spend, ctr].some(v => Number.isFinite(v))

  const creativeType = ad.creative?.video_url || ad.creative?.video_id
    ? 'video'
    : (ad.creative?.image_url || ad.creative?.thumbnail_url ? 'image' : 'unknown')

  return { impressions, clicks, spend, ctr, hasMetrics, creativeType }
}

function createDefaultFilters() {
  return {
    platforms: new Set(),
    statuses: new Set(),
    spendMin: undefined,
    spendMax: undefined,
    ctrMin: undefined,
    ctrMax: undefined,
    impressionsMin: undefined,
    impressionsMax: undefined,
    creativeType: 'any',
    dateRangeDays: 30
  }
}

function applyFilters(ads, filters) {
  return ads.filter(ad => {
    const metrics = normalizeMetrics(ad)
    const adPlatform = ad.platform || 'meta'

    if (filters.platforms.size && !filters.platforms.has(adPlatform)) return false
    if (filters.statuses.size && !filters.statuses.has(ad.effective_status)) return false

    if (filters.creativeType !== 'any') {
      if (filters.creativeType !== metrics.creativeType) return false
    }

    if (filters.impressionsMin != null) {
      if (metrics.impressions == null || metrics.impressions < filters.impressionsMin) return false
    }
    if (filters.impressionsMax != null) {
      if (metrics.impressions == null || metrics.impressions > filters.impressionsMax) return false
    }

    if (filters.spendMin != null) {
      if (metrics.spend == null || metrics.spend < filters.spendMin) return false
    }
    if (filters.spendMax != null) {
      if (metrics.spend == null || metrics.spend > filters.spendMax) return false
    }

    if (filters.ctrMin != null) {
      if (metrics.ctr == null || metrics.ctr < filters.ctrMin) return false
    }
    if (filters.ctrMax != null) {
      if (metrics.ctr == null || metrics.ctr > filters.ctrMax) return false
    }

    return true
  })
}

function serializeFilters(filters) {
  const params = new URLSearchParams()

  if (filters.platforms.size) params.set('platforms', Array.from(filters.platforms).join(','))
  if (filters.statuses.size) params.set('statuses', Array.from(filters.statuses).join(','))
  if (filters.spendMin != null) params.set('spendMin', String(filters.spendMin))
  if (filters.spendMax != null) params.set('spendMax', String(filters.spendMax))
  if (filters.ctrMin != null) params.set('ctrMin', String(filters.ctrMin))
  if (filters.ctrMax != null) params.set('ctrMax', String(filters.ctrMax))
  if (filters.impressionsMin != null) params.set('impressionsMin', String(filters.impressionsMin))
  if (filters.impressionsMax != null) params.set('impressionsMax', String(filters.impressionsMax))
  if (filters.creativeType && filters.creativeType !== 'any') params.set('creativeType', filters.creativeType)
  if (filters.dateRangeDays != null) params.set('dateRangeDays', String(filters.dateRangeDays))

  return params.toString()
}

function parseFilters(queryString) {
  const normalized = queryString.startsWith('?') ? queryString.slice(1) : queryString
  const params = new URLSearchParams(normalized)
  const filters = createDefaultFilters()

  const platforms = params.get('platforms')
  if (platforms) filters.platforms = new Set(platforms.split(',').filter(Boolean))

  const statuses = params.get('statuses')
  if (statuses) filters.statuses = new Set(statuses.split(',').filter(Boolean))

  const spendMin = Number(params.get('spendMin'))
  if (Number.isFinite(spendMin)) filters.spendMin = spendMin

  const spendMax = Number(params.get('spendMax'))
  if (Number.isFinite(spendMax)) filters.spendMax = spendMax

  const ctrMin = Number(params.get('ctrMin'))
  if (Number.isFinite(ctrMin)) filters.ctrMin = ctrMin

  const ctrMax = Number(params.get('ctrMax'))
  if (Number.isFinite(ctrMax)) filters.ctrMax = ctrMax

  const impressionsMin = Number(params.get('impressionsMin'))
  if (Number.isFinite(impressionsMin)) filters.impressionsMin = impressionsMin

  const impressionsMax = Number(params.get('impressionsMax'))
  if (Number.isFinite(impressionsMax)) filters.impressionsMax = impressionsMax

  const creativeType = params.get('creativeType')
  if (creativeType === 'image' || creativeType === 'video') {
    filters.creativeType = creativeType
  }

  const dateRangeDays = Number(params.get('dateRangeDays'))
  if (Number.isFinite(dateRangeDays) && dateRangeDays > 0) {
    filters.dateRangeDays = dateRangeDays
  }

  return filters
}

module.exports = {
  normalizeMetrics,
  applyFilters,
  serializeFilters,
  parseFilters
}
