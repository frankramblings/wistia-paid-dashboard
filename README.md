# Ad Creative Tracker

A modern web application for tracking Meta (Facebook/Instagram) and Google Ads performance with real-time metrics and visual previews.

## Features

- 📊 **Real-time Performance Metrics** - Track impressions, clicks, spend, CTR, and more
- 🎨 **Visual Ad Previews** - See your ads as they appear on Facebook/Instagram
- 🔄 **Manual Refresh** - One-click refresh button to get latest data instantly
- ⏰ **Auto-refresh** - Toggle auto-refresh with configurable intervals (1m, 5m, 10m, 30m, 1h)
- 🔍 **Search & Filter** - Quickly find specific ads
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Fast & Scalable** - Built with Next.js and deployed on Vercel

## Quick Start

### 1. Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ad-tracker-app)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variables (see below)
4. Deploy!

### 2. Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your tokens
nano .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

### Required for Meta Ads

```bash
META_ACCESS_TOKEN=your_long_lived_meta_access_token
META_AD_ACCOUNT_ID=act_759309829868
```

### Optional for Google Ads (Future)

```bash
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
```

## Setting Up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `META_ACCESS_TOKEN`
   - Value: Your Meta access token
   - Environment: Production, Preview, Development
4. Repeat for `META_AD_ACCOUNT_ID`
5. Redeploy your app

## Getting Your Meta Access Token

Your current access token is already in `/sessions/epic-clever-cori/mnt/outputs/ad_platform_tokens.json`.

To get a long-lived token (recommended for production):

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to Business Settings → Users → System Users
3. Create a system user with **Ads Management** permission
4. Generate a token with `ads_read` permission
5. Set token to never expire (or 60 days max)

## Sharing with Colleagues

### Option 1: Vercel Deployment (Recommended)
- Share the Vercel URL: `https://your-app.vercel.app`
- Colleagues can access instantly, no setup needed
- Updates automatically when you push to GitHub

### Option 2: Private Access
- Add authentication to protect your dashboard
- Use Vercel's built-in password protection
- Or add a simple auth layer with NextAuth.js

## Project Structure

```
ad-tracker-app/
├── app/
│   ├── layout.tsx          # App layout with Font Awesome
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── pages/
│   └── api/
│       └── meta/
│           └── ads.ts      # API endpoint to fetch Meta ads
├── public/                 # Static assets
├── .env.local.example      # Example environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── README.md              # This file
```

## How It Works

1. **Frontend** (`app/page.tsx`): React dashboard that displays ads
2. **API Route** (`pages/api/meta/ads.ts`): Serverless function that:
   - Fetches ads from Meta Marketing API
   - Fetches post messages for each ad
   - Returns formatted data to frontend
3. **Environment Variables**: Securely store OAuth tokens server-side
4. **Vercel**: Hosts everything with zero configuration

## Adding Google Ads (Future)

Create `pages/api/google/ads.ts`:

```typescript
// Similar structure to Meta API route
// Fetch from Google Ads API
// Return formatted data
```

Then update the dashboard to switch between platforms.

## Troubleshooting

### "Failed to fetch ads"
- Check your Meta access token hasn't expired
- Verify `META_AD_ACCOUNT_ID` is correct (should start with `act_`)
- Check Vercel logs for detailed error messages

### No ads showing
- Ensure you have active ads in your account
- Check that your token has `ads_read` permission
- Try refreshing the data with the Refresh button

### Images not loading
- Facebook CDN images require proper CORS headers (handled by Next.js config)
- If images fail, check `next.config.js` remote patterns

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Deployment**: Vercel
- **Language**: TypeScript

## Contributing

This is a private tool, but feel free to customize:
- Add more platforms (TikTok, LinkedIn, Twitter)
- Improve the UI/UX
- Add export to CSV/Excel
- Create custom reports
- Add date range filtering

## License

Private - Internal use only
