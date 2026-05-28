# Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/growwise"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cron Job Secret
CRON_SECRET="your-cron-secret-here"

# Gemini AI (optional)
GEMINI_API_KEY="your-gemini-api-key"
```

## 2. Database Setup

After creating the `.env.local` file, run:

```bash
npm run db:setup
```

## 3. Start Development Server

```bash
npm run dev
```

## 4. Initial Data Load

Visit `http://localhost:3000/api/mf` to load initial fund data, or set up a cron job to call `/api/cron/update-funds` daily.

## Features Available

- **Fund Explorer**: Browse and search mutual funds with advanced filtering
- **SIP Calculator**: Calculate SIP returns using historical NAV data
- **Lumpsum Calculator**: Calculate lumpsum investment returns
- **SWP Calculator**: Calculate Systematic Withdrawal Plan returns
- **Rolling Returns**: Analyze rolling returns for different periods
- **Watchlist**: Track your favorite funds
- **Virtual Portfolio**: Simulate investment strategies
- **AI Assistant**: Get investment advice with AI-powered chat
- **Real-time Data**: Live data from MFAPI.in with fallback to mock data
- **Modern UI**: Beautiful, responsive design inspired by Groww

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Make sure MongoDB is running and the DATABASE_URL is correct
2. **API Errors**: The app will automatically fall back to mock data if external APIs fail
3. **Authentication Issues**: Ensure NEXTAUTH_SECRET is set and Google OAuth credentials are configured
4. **Port Conflicts**: The app will automatically use port 3001 if 3000 is occupied

### Mock Data

The app includes comprehensive mock data that will be used if:
- External APIs are unavailable
- Database connection fails
- Network issues occur

This ensures the app always works for demonstration purposes.

## API Endpoints

- `GET /api/mf` - Get all funds
- `GET /api/mf/[schemecode]` - Get fund details
- `GET /api/mf/[schemecode]/returns` - Calculate returns
- `POST /api/mf/[schemecode]/sip` - Calculate SIP returns
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `GET /api/virtual-portfolio` - Get virtual portfolios
- `POST /api/virtual-portfolio` - Create virtual portfolio
