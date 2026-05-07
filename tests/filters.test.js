const test = require('node:test')
const assert = require('node:assert/strict')

const { applyFilters, serializeFilters, parseFilters } = require('../app/lib/filters')

test('applyFilters respects platform/status/metric ranges and missing metrics', () => {
  const ads = [
    { id: '1', platform: 'meta', effective_status: 'ACTIVE', insights: { data: [{ impressions: '100', clicks: '10', spend: '50', ctr: '10.0' }] }, creative: { image_url: 'x' } },
    { id: '2', platform: 'linkedin', effective_status: 'PAUSED', insights: { data: [{ impressions: '0', clicks: '0', spend: '0', ctr: '0.0' }] }, creative: { image_url: '' } },
    { id: '3', platform: 'google', effective_status: 'ACTIVE', insights: { data: [] }, creative: { video_url: 'y' } }
  ]

  const filters = {
    platforms: new Set(['meta', 'google']),
    statuses: new Set(['ACTIVE']),
    spendMin: 10,
    spendMax: 60,
    ctrMin: 1,
    ctrMax: 15,
    impressionsMin: 50,
    impressionsMax: 200,
    creativeType: 'image',
    dateRangeDays: 30
  }

  const result = applyFilters(ads, filters)
  assert.equal(result.length, 1)
  assert.equal(result[0].id, '1')
})

test('applyFilters excludes missing metrics when ranges are set and detects creative type', () => {
  const ads = [
    { id: '1', platform: 'meta', effective_status: 'ACTIVE', insights: { data: [] }, creative: { video_url: 'v' } },
    { id: '2', platform: 'meta', effective_status: 'ACTIVE', insights: { data: [{ impressions: '5', clicks: '1', spend: '2', ctr: '20' }] }, creative: { image_url: 'i' } }
  ]

  const filters = {
    platforms: new Set(['meta']),
    statuses: new Set(['ACTIVE']),
    spendMin: 1,
    spendMax: 10,
    ctrMin: 10,
    ctrMax: 30,
    impressionsMin: 1,
    impressionsMax: 10,
    creativeType: 'video',
    dateRangeDays: 30
  }

  const result = applyFilters(ads, filters)
  assert.equal(result.length, 0)
})

test('serializeFilters and parseFilters round-trip filter state', () => {
  const filters = {
    platforms: new Set(['meta', 'google']),
    statuses: new Set(['ACTIVE']),
    spendMin: 10,
    spendMax: 100,
    ctrMin: 1,
    ctrMax: 5,
    impressionsMin: 1000,
    impressionsMax: 5000,
    creativeType: 'image',
    dateRangeDays: 90
  }

  const query = serializeFilters(filters)
  const parsed = parseFilters(query)

  assert.deepEqual(Array.from(parsed.platforms).sort(), ['google', 'meta'])
  assert.deepEqual(Array.from(parsed.statuses), ['ACTIVE'])
  assert.equal(parsed.spendMin, 10)
  assert.equal(parsed.spendMax, 100)
  assert.equal(parsed.ctrMin, 1)
  assert.equal(parsed.ctrMax, 5)
  assert.equal(parsed.impressionsMin, 1000)
  assert.equal(parsed.impressionsMax, 5000)
  assert.equal(parsed.creativeType, 'image')
  assert.equal(parsed.dateRangeDays, 90)
})
