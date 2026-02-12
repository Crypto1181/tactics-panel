# Admin API Backend

This is a **REST API** that handles Firebase writes. The admin panel makes simple HTTP requests - no Firebase SDK needed!

## Setup

### 1. Install Dependencies
```bash
cd admin-api
npm install
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **Tactics-v1**
3. Click ⚙️ **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `serviceAccountKey.json` in the `admin-api` folder

### 3. Run Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on: `http://localhost:3001`

## API Endpoints

### Create Competition
```
POST /api/competitions
Body: { "title": "Premier League", "prizePool": 1000 }
```

### Get Competitions
```
GET /api/competitions
```

### Add Match
```
POST /api/matches
Body: {
  "competitionId": "abc123",
  "team1": "Arsenal",
  "team2": "Chelsea",
  "matchDate": "2024-12-25",
  "matchTime": "15:00"
}
```

### Update Match
```
PUT /api/matches/:id
Body: { "team1": "New Team", ... }
```

### Delete Match
```
DELETE /api/matches/:id
```

### Get Matches
```
GET /api/competitions/:competitionId/matches
```

## Deploy

You can deploy this to:
- **Railway** (easiest): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **Vercel** (with serverless functions)

## How It Works

1. **Admin Panel** → Makes HTTP requests to this API
2. **This API** → Writes to Firebase (server-side, reliable)
3. **Flutter App** → Reads from Firebase (already working)

No Firebase SDK in admin panel = No connection issues! 🎉


















