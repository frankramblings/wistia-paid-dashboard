const test = require('node:test')
const assert = require('node:assert/strict')

const { buildAdAnalyticsQuery, getAnalyticsDateRange } = require('../pages/api/linkedin/analytics-utils')

test('buildAdAnalyticsQuery formats creatives list and dateRange without encoding commas', () => {
  const query = buildAdAnalyticsQuery({
    creativeUrn: 'urn:li:sponsoredCreative:123456',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-01-31T00:00:00Z'),
    fields: ['impressions', 'clicks', 'costInLocalCurrency'],
    accountUrn: 'urn:li:sponsoredAccount:999'
  })

  assert.match(query, /q=analytics/)
  assert.match(query, /pivot=CREATIVE/)
  assert.match(query, /timeGranularity=ALL/)
  assert.match(query, /dateRange=\(start:\(year:2026,month:1,day:1\),end:\(year:2026,month:1,day:31\)\)/)
  assert.match(query, /creatives=List\(urn%3Ali%3AsponsoredCreative%3A123456\)/)
  assert.match(query, /fields=impressions,clicks,costInLocalCurrency/)
  assert.match(query, /accounts=List\(urn%3Ali%3AsponsoredAccount%3A999\)/)
})

test('getAnalyticsDateRange clamps days back and returns start date', () => {
  const endDate = new Date('2026-02-01T00:00:00Z')
  const { startDate } = getAnalyticsDateRange(endDate, 4000)

  assert.equal(startDate.toISOString().slice(0, 10), '2016-02-04')
})
