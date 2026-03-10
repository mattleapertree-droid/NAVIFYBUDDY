// Fill these values with your real Firebase project configuration
// from the Firebase console (Web app settings).
// Do NOT paste AndroidManifest.xml here – only the firebaseConfig object.
window.NAVIFY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyADAAL8kEH5vkbhyyXW3wPafqGhyX9FX-8",
  authDomain: "navify-703b8.firebaseapp.com",
  projectId: "navify-703b8",
  storageBucket: "navify-703b8.firebasestorage.app",
  messagingSenderId: "727754095633",
  appId: "1:727754095633:web:42aaefaef766504496c5b0",
  measurementId: "G-0WHQDRRW5R"
};

(function initFirebase() {
  if (!window.firebase) {
    console.warn('Firebase SDK not loaded; Navify auth is disabled.');
    return;
  }
  try {
    window.navifyFirebaseApp = firebase.initializeApp(window.NAVIFY_FIREBASE_CONFIG);
    window.navifyAuth = firebase.auth();
    window.navifyDb = firebase.database();
    window.navifyStorage = firebase.storage();
    
    console.log('✓ Firebase initialized successfully');
    console.log('Auth:', window.navifyAuth ? 'Ready' : 'Not ready');
    console.log('Database:', window.navifyDb ? 'Ready' : 'Not ready');
    
    // Listen for auth state changes - persist user session
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('User logged in:', user.email);
        localStorage.setItem('navify-user', JSON.stringify({
          uid: user.uid,
          email: user.email || null,
          name: user.displayName || 'Traveler',
          photoURL: user.photoURL || null,
          loggedInAt: Date.now(),
          phoneVerified: user.phoneNumber ? true : false
        }));
        window.currentUser = user;
        // Update last seen timestamp and user data in database
        const userData = {
          lastSeen: Date.now(),
          email: user.email || null,
          name: user.displayName || 'Traveler',
          verified: user.emailVerified || false,
          createdAt: user.metadata?.creationTime || Date.now()
        };
        firebase.database().ref('users/' + user.uid).update(userData);
      } else {
        console.log('User logged out');
        localStorage.removeItem('navify-user');
        window.currentUser = null;
      }
    });
  } catch (err) {
    console.error('Failed to initialize Firebase for Navify:', err);
  }
})();

// Phone verification utilities
window.validatePhoneNumber = (phone) => {
  // Philippine format: 09XXXXXXXXX or +639XXXXXXXXX
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const phoneRegex = /^(\+63|0)9\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

window.formatPhoneNumber = (phone) => {
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('0')) {
    return '+63' + clean.substring(1);
  }
  return clean.startsWith('+') ? clean : '+63' + clean;
};

// Store verified phone numbers for authentication
window.verifyUserPhone = (userId, phoneNumber) => {
  if (!window.validatePhoneNumber(phoneNumber)) {
    return Promise.reject('Invalid phone number format');
  }
  const formatted = window.formatPhoneNumber(phoneNumber);
  return firebase.database().ref('users/' + userId + '/phone').set({
    number: formatted,
    verified: true,
    verifiedAt: Date.now()
  });
};

// Real-time location sharing
window.shareLocationToFirebase = (uid, lat, lng, address) => {
  if (!window.navifyDb || !uid) return;
  return window.navifyDb.ref(`users/${uid}/location`).set({
    lat: lat,
    lng: lng,
    address: address || 'Current location',
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    isSharing: true
  });
};

// Stop sharing location
window.stopSharingLocation = (uid) => {
  if (!window.navifyDb || !uid) return;
  return window.navifyDb.ref(`users/${uid}/location`).remove();
};

// Listen to friend's location in real-time
window.listenToFriendLocation = (friendUid, callback) => {
  if (!window.navifyDb || !friendUid) return () => {};
  const ref = window.navifyDb.ref(`users/${friendUid}/location`);
  ref.on('value', (snapshot) => {
    const location = snapshot.val();
    if (callback) callback(location);
  });
  return () => ref.off();
};

// Get nearby users within specified radius (km)
window.getNearbyUsers = async (myLat, myLng, radiusKm = 5) => {
  if (!window.navifyDb) return [];
  
  const snapshot = await window.navifyDb.ref('users').once('value');
  const users = [];
  
  snapshot.forEach((child) => {
    const userData = child.val();
    const userLoc = userData?.location;
    
    // Only include users who are actively sharing location (isSharing must be true)
    if (userLoc && userLoc.lat && userLoc.lng && userLoc.isSharing === true && child.key !== firebase.auth().currentUser?.uid) {
      const distance = haversineKm({ lat: myLat, lng: myLng }, { lat: userLoc.lat, lng: userLoc.lng });
      if (distance <= radiusKm && distance > 0) {
        users.push({
          uid: child.key,
          name: userData?.name || userData?.displayName || 'User',
          phone: userData?.phone?.number || userData?.phone || 'N/A',
          location: {
            lat: userLoc.lat,
            lng: userLoc.lng
          },
          address: userLoc.address || userLoc.label || 'Nearby',
          distance: distance.toFixed(2),
          lastSeen: userData?.lastSeen || Date.now(),
          verified: userData?.verified || false
        });
      }
    }
  });
  
  return users.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Get friend profile data
window.getFriendProfile = async (friendUid) => {
  if (!window.navifyDb || !friendUid) return null;
  const snapshot = await window.navifyDb.ref(`users/${friendUid}`).once('value');
  return snapshot.val();
};

// Find user by phone number
window.findUserByPhone = async (phoneNumber) => {
  if (!window.navifyDb || !phoneNumber) return null;
  
  try {
    console.log('🔍 Searching Firebase for phone:', phoneNumber);
    
    // Format the phone number for consistency
    const formattedPhone = window.formatPhoneNumber(phoneNumber);
    console.log('Formatted phone:', formattedPhone);
    
    // Search through all users for matching phone
    const snapshot = await window.navifyDb.ref('users').once('value');
    
    let foundUser = null;
    snapshot.forEach((child) => {
      const userData = child.val();
      const userPhone = userData?.phone?.number || userData?.phone;
      
      console.log('Checking user', child.key, '- has phone:', userPhone);
      
      if (userPhone === formattedPhone || userPhone === phoneNumber) {
        foundUser = {
          uid: child.key,
          name: userData?.name || userData?.displayName || 'User',
          email: userData?.email || null,
          phone: userPhone,
          location: userData?.location || null,
          lastSeen: userData?.lastSeen || null,
          verified: userData?.verified || false
        };
        console.log('✓ Found matching user:', foundUser.name);
      }
    });
    
    if (!foundUser) {
      console.log('❌ No matching user found for phone:', phoneNumber);
    }
    
    return foundUser;
  } catch (err) {
    console.error('Error finding user by phone:', err);
    return null;
  }
};
