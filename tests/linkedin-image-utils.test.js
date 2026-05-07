const test = require('node:test')
const assert = require('node:assert/strict')

const {
  pickVectorImageUrl,
  extractLinkedInImageSource,
  resolveLinkedInImageUrl
} = require('../pages/api/linkedin/image-utils')

test('pickVectorImageUrl builds url from rootUrl and largest artifact', () => {
  const vectorImage = {
    rootUrl: 'https://media.licdn.com/dms/image/',
    artifacts: [
      { width: 200, fileIdentifyingUrlPathSegment: 'small' },
      { width: 1200, fileIdentifyingUrlPathSegment: 'large' }
    ]
  }

  assert.equal(
    pickVectorImageUrl(vectorImage),
    'https://media.licdn.com/dms/image/large'
  )
})

test('extractLinkedInImageSource prefers direct image URL when available', () => {
  const input = {
    content: {},
    textAdContent: {},
    shareContent: {
      media: {
        images: [{ url: 'https://cdn.example.com/ad.jpg' }]
      }
    }
  }

  assert.equal(
    extractLinkedInImageSource(input),
    'https://cdn.example.com/ad.jpg'
  )
})

test('extractLinkedInImageSource falls back to asset urn', () => {
  const input = {
    content: {},
    textAdContent: {},
    shareContent: {
      media: {
        images: [{ urn: 'urn:li:digitalmediaAsset:ABC123' }]
      }
    }
  }

  assert.equal(
    extractLinkedInImageSource(input),
    'urn:li:digitalmediaAsset:ABC123'
  )
})

test('resolveLinkedInImageUrl returns direct url without fetching', async () => {
  const url = await resolveLinkedInImageUrl('https://cdn.example.com/ad.jpg', {
    accessToken: 'token',
    fetchFn: async () => ({ ok: false })
  })

  assert.equal(url, 'https://cdn.example.com/ad.jpg')
})

test('resolveLinkedInImageUrl resolves asset urn via assets endpoint', async () => {
  let requestedUrl = ''
  const fetchFn = async (url) => {
    requestedUrl = url
    return {
      ok: true,
      json: async () => ({ downloadUrl: 'https://media.licdn.com/dms/image/abc' })
    }
  }

  const url = await resolveLinkedInImageUrl('urn:li:digitalmediaAsset:ABC123', {
    accessToken: 'token',
    fetchFn
  })

  assert.equal(url, 'https://media.licdn.com/dms/image/abc')
  assert.match(requestedUrl, /https:\/\/api\.linkedin\.com\/rest\/assets\/urn%3Ali%3AdigitalmediaAsset%3AABC123/)
})

test('resolveLinkedInImageUrl resolves share urn via shares endpoint', async () => {
  let callCount = 0
  const fetchFn = async (url) => {
    callCount += 1
    if (url.includes('/rest/shares/')) {
      return { ok: false }
    }
    if (url.includes('/v2/shares/')) {
      return {
        ok: true,
        json: async () => ({
          content: {
            contentEntities: [
              { thumbnails: [{ resolvedUrl: 'https://media.example.com/share.jpg' }] }
            ]
          }
        })
      }
    }
    return { ok: false }
  }

  const url = await resolveLinkedInImageUrl('urn:li:share:123', {
    accessToken: 'token',
    fetchFn
  })

  assert.equal(url, 'https://media.example.com/share.jpg')
  assert.ok(callCount >= 2)
})
