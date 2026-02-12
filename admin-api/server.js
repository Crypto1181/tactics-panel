const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (server-side, more reliable)
let db = null;
let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    let serviceAccount;

    // 1. Try to load from Environment Variable (Recommended for Live Deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Loading Firebase credentials from environment variable');
      } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON');
      }
    }

    // 2. Fallback to local files if env var is missing
    if (!serviceAccount) {
      try {
        serviceAccount = require('./serviceAccountKey.json');
        console.log('📂 Loading Firebase credentials from serviceAccountKey.json');
      } catch (e) {
        try {
          serviceAccount = require('../google-services (1).json');
          console.log('📂 Loading Firebase credentials from google-services (1).json');
        } catch (err) {
          // No credentials found
        }
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'tactics-v1'
      });
      db = admin.firestore();
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      throw new Error('No Firebase credentials found (env var or local file)');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('\n📝 To fix this:');
    console.log('1. Go to: https://console.firebase.google.com');
    console.log('2. Select project: Tactics-v1');
    console.log('3. Click ⚙️ Project Settings → Service Accounts');
    console.log('4. Click "Generate New Private Key"');
    console.log('5. Save the JSON file as: admin-api/serviceAccountKey.json');
    console.log('\n⚠️  Server will start but API endpoints will not work until Firebase is initialized.\n');
  }
}

// Middleware to check Firebase initialization
const checkFirebase = (req, res, next) => {
  if (!firebaseInitialized) {
    return res.status(503).json({ 
      error: 'Firebase not initialized. Please add serviceAccountKey.json file.' 
    });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin API is running' });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', firebase: !!admin.apps.length });
});

// Create Competition
app.post('/api/competitions', checkFirebase, async (req, res) => {
  try {
    const { title, prizePool } = req.body;
    
    if (!title || !prizePool) {
      return res.status(400).json({ error: 'Missing title or prizePool' });
    }

    const competitionData = {
      title: title.trim(),
      prizePool: parseInt(prizePool),
      status: 'active',
      entryFee: 0,
      description: title.trim(),
      startDate: admin.firestore.Timestamp.now(),
      endDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      createdAt: admin.firestore.Timestamp.now(),
      participants: [],
      createdBy: 'admin',
    };

    const docRef = await db.collection('competitions').add(competitionData);
    
    res.json({ 
      success: true, 
      id: docRef.id,
      message: 'Competition created successfully' 
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.message);
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
      errorMessage = 'Firestore database not found. Please enable Firestore in Firebase Console: https://console.firebase.google.com/project/tactics-v1/firestore';
    }
    
    res.status(500).json({ error: errorMessage, code: error.code });
  }
});

// Get Competitions
app.get('/api/competitions', checkFirebase, async (req, res) => {
  try {
    const snapshot = await db.collection('competitions')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();
    
    const competitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, data: competitions });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add Match
app.post('/api/matches', checkFirebase, async (req, res) => {
  try {
    const { competitionId, team1, team2, matchDate, matchTime } = req.body;
    
    if (!competitionId || !team1 || !team2 || !matchDate || !matchTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    const matchData = {
      competitionId: competitionId,
      team1: team1.trim(),
      team2: team2.trim(),
      matchDateTime: admin.firestore.Timestamp.fromDate(matchDateTime),
      status: 'upcoming',
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('matches').add(matchData);
    
    res.json({ 
      success: true, 
      id: docRef.id,
      message: 'Match added successfully' 
    });
  } catch (error) {
    console.error('Error adding match:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Match
app.put('/api/matches/:id', checkFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const { team1, team2, matchDate, matchTime, status } = req.body;
    
    const updateData = {};
    if (team1) updateData.team1 = team1.trim();
    if (team2) updateData.team2 = team2.trim();
    if (matchDate && matchTime) {
      const matchDateTime = new Date(`${matchDate}T${matchTime}`);
      updateData.matchDateTime = admin.firestore.Timestamp.fromDate(matchDateTime);
    }
    if (status) updateData.status = status;

    await db.collection('matches').doc(id).update(updateData);
    
    res.json({ success: true, message: 'Match updated successfully' });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Match
app.delete('/api/matches/:id', checkFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('matches').doc(id).delete();
    res.json({ success: true, message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: error.message });
  }
});

// Notify New Competition via FCM
app.post('/api/notify-new-competition', checkFirebase, async (req, res) => {
  try {
    const { title, competitionId } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Missing competition title' });
    }

    const message = {
      notification: {
        title: 'New Competition Available! 🏆',
        body: `Join now: ${title}`,
      },
      data: {
        competitionId: competitionId || '',
        type: 'new_competition'
      },
      topic: 'all_users' // We'll have the app subscribe to this topic
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent FCM message:', response);
    
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error sending FCM message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Notify New Match via FCM
app.post('/api/notify-new-match', checkFirebase, async (req, res) => {
  try {
    const { competitionTitle, competitionId, team1, team2 } = req.body;
    
    if (!competitionTitle) {
      return res.status(400).json({ error: 'Missing competition title' });
    }

    const message = {
      notification: {
        title: 'New Competition Available! 🏆',
        body: `Join ${competitionTitle} now. Tap for more details.`,
      },
      data: {
        competitionId: String(competitionId || ''),
        type: 'new_competition',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      topic: 'all_users'
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent FCM message for competition:', response);
    
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error sending FCM message for competition:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Matches for Competition
app.get('/api/competitions/:competitionId/matches', checkFirebase, async (req, res) => {
  try {
    const { competitionId } = req.params;
    const snapshot = await db.collection('matches')
      .where('competitionId', '==', competitionId)
      .orderBy('matchDateTime', 'asc')
      .get();
    
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Admin API server running on port ${PORT}`);
});

