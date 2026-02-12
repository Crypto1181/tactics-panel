# Simple Admin Panel (No Firebase SDK!)

This is a **pure HTML/JavaScript** admin panel that uses the REST API backend. **No Firebase SDK** = No connection issues!

## How It Works

1. **This HTML file** → Makes HTTP requests to REST API
2. **REST API** → Writes to Firebase (server-side)
3. **Flutter App** → Reads from Firebase (already working)

## Setup

### 1. Start the API Server
```bash
cd ../admin-api
npm install
npm start
```

### 2. Open the Admin Panel

**Option A: Open directly in browser**
- Double-click `index.html`
- Or right-click → Open with → Browser

**Option B: Use a simple server (recommended)**
```bash
# Python
python3 -m http.server 8080

# Node.js
npx http-server -p 8080

# Then open: http://localhost:8080
```

### 3. Update API URL (if needed)

If your API is running on a different port or deployed, edit `index.html`:
```javascript
const API_URL = 'http://localhost:3001'; // Change this
```

## Features

✅ **Page 1:** Create competition (name + token prize)  
✅ **Page 2:** Add, edit, delete matches  
✅ **No Firebase SDK** - Just HTTP requests  
✅ **Simple HTML** - Works anywhere  

## Deploy

You can host this HTML file on:
- **GitHub Pages** (free)
- **Netlify** (free)
- **Vercel** (free)
- Any static hosting

Just make sure to update the `API_URL` to point to your deployed API!


















