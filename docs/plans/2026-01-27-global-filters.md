# Global Performance Filters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add global, performance-focused filters (platform, status, spend, CTR, impressions, date range, creative type) with quick pills and URL sync on the dashboard.

**Architecture:** Implement client-side filter state and predicates in `app/page.tsx`, backed by pure helper functions in a new `app/lib/filters.ts`. Filters are serialized to query params for shareable URLs. No backend changes.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, node:test for unit tests.

### Task 1: Add filter helpers and unit tests

**Files:**
- Create: `app/lib/filters.ts`
- Create: `tests/filters.test.js`

**Step 1: Write the failing test**

```javascript
const test = require('node:test')
const assert = require('node:assert/strict')

const { applyFilters } = require('../app/lib/filters')

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
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/filters.test.js`
Expected: FAIL with "Cannot find module" or "applyFilters is not a function"

**Step 3: Write minimal implementation**

```typescript
// app/lib/filters.ts
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

export function normalizeMetrics(ad: any) {
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

export function applyFilters(ads: any[], filters: FilterState) {
  return ads.filter(ad => {
    const metrics = normalizeMetrics(ad)

    if (filters.platforms.size && !filters.platforms.has(ad.platform)) return false
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
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/filters.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app/lib/filters.ts tests/filters.test.js
git commit -m "feat: add filter helpers and tests"
```

### Task 2: Add filter state, UI, and filtering pipeline

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write the failing test**

Add a second test that verifies creativeType detection and “missing metrics” exclusion when ranges are set. Append to `tests/filters.test.js`.

**Step 2: Run test to verify it fails**

Run: `node --test tests/filters.test.js`
Expected: FAIL with assertion mismatch

**Step 3: Write minimal implementation**

- Import `applyFilters`/`normalizeMetrics`.
- Add `filters` state with defaults.
- Add quick pills (Active, Paused, High Spend, Low CTR, No Impressions) that update filter state.
- Add UI controls: platform/status multi-select (buttons), spend/CTR/impressions min/max inputs, date range buttons (7/30/90/custom), creative type toggle.
- Compute `filteredAds` via `useMemo(() => applyFilters(ads, filters), [ads, filters])`.
- Add “Clear all” and “Active filters” count.

**Step 4: Run test to verify it passes**

Run: `node --test tests/filters.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx tests/filters.test.js
git commit -m "feat: add global performance filter UI"
```

### Task 3: URL query sync for filters

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write the failing test**

Add a test for `serializeFilters`/`parseFilters` helpers in `app/lib/filters.ts` (create those helpers).

**Step 2: Run test to verify it fails**

Run: `node --test tests/filters.test.js`
Expected: FAIL with missing functions

**Step 3: Write minimal implementation**

- Add `serializeFilters(filters)` and `parseFilters(queryString)` helpers.
- Use `useEffect` to read query params on mount and set filter state.
- Use `useEffect` to update URL via `window.history.replaceState` on filter changes.

**Step 4: Run test to verify it passes**

Run: `node --test tests/filters.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app/lib/filters.ts app/page.tsx tests/filters.test.js
git commit -m "feat: sync filters to URL"
```

### Task 4: Verification

**Files:**
- None

**Step 1: Run lint**

Run: `npm run lint`
Expected: Warning(s) about `<img>` only, no errors

**Step 2: Manual smoke check**

- `npm run dev` and open the dashboard
- Verify filters apply correctly, pills update values, and URL updates

**Step 3: Commit any fixes**

If changes were needed:
```bash
git add app/page.tsx app/lib/filters.ts tests/filters.test.js
git commit -m "fix: adjust filter behavior"
```
