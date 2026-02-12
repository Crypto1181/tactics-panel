# 🔧 Quick Setup Guide

## The Error You Saw

The error happened because the server needs a **Firebase Service Account Key** to connect to Firebase. This is different from the Firebase SDK - it's a server-side authentication file.

## ✅ Fix It (5 minutes)

### Step 1: Get Service Account Key

1. Go to: https://console.firebase.google.com
2. Select your project: **Tactics-v1**
3. Click the ⚙️ **gear icon** (top left) → **Project Settings**
4. Click the **Service Accounts** tab
5. Click **Generate New Private Key** button
6. A JSON file will download

### Step 2: Save the File

1. Rename the downloaded file to: `serviceAccountKey.json`
2. Move it to: `admin-api/serviceAccountKey.json`

**Important:** The file should be in the same folder as `server.js`

### Step 3: Restart Server

```bash
npm start
```

You should now see:
```
✅ Firebase Admin initialized successfully
🚀 Admin API server running on http://localhost:3001
```

## 🎯 What This Does

- **Service Account Key** = Server-side authentication to Firebase
- **No Firebase SDK** in admin panel = No connection issues
- **Server handles Firebase** = More reliable

## 🔒 Security Note

- **Never commit** `serviceAccountKey.json` to Git (it's already in `.gitignore`)
- This file gives full access to your Firebase project
- Keep it secure and private

## ✅ Test It

1. Start server: `npm start`
2. Open: `http://localhost:3001/health`
3. Should see: `{"status":"ok","message":"Admin API is running"}`

Then open the admin panel HTML file and try creating a competition!

