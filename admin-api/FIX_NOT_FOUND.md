# 🔧 Fix "5 NOT_FOUND" Error

## The Problem

The error `5 NOT_FOUND` means **Firestore database is not enabled** in your Firebase project.

## ✅ Quick Fix (2 minutes)

### Step 1: Enable Firestore

1. Go to: https://console.firebase.google.com/project/tactics-v1/firestore
2. If you see **"Get started"** or **"Create database"** button:
   - Click it
   - Choose **"Start in production mode"** (we'll set rules separately)
   - Select a location (choose closest to you)
   - Click **"Enable"**
   - Wait 1-2 minutes for database to be created

3. If Firestore is already enabled, check:
   - Go to **Firestore Database** → **Data** tab
   - You should see an empty database (that's fine)

### Step 2: Set Firestore Rules

1. Go to: https://console.firebase.google.com/project/tactics-v1/firestore/rules
2. Replace all rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click **"Publish"**
4. Wait 2-3 minutes for rules to propagate

### Step 3: Restart API Server

```bash
# Stop current server (Ctrl+C)
cd admin-api
npm start
```

### Step 4: Test Again

1. Open admin panel: http://localhost:8080/admin-panel-simple/index.html
2. Try creating a competition
3. Should work now! ✅

## 🎯 What This Does

- **Enables Firestore** = Creates the database
- **Sets rules** = Allows read/write access
- **Restarts server** = Connects to the database

## ⚠️ If Still Not Working

Check server logs for:
- `✅ Firebase Admin initialized successfully` = Good
- `❌ Error...` = Problem with service account key

Make sure:
- Service account key file exists: `admin-api/serviceAccountKey.json`
- Firestore is enabled (not just Realtime Database)
- Rules are published (not just saved)

