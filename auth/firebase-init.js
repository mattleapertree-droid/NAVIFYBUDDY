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

// Real-time location sharing WITH GPS ACCURACY TRACKING
window.shareLocationToFirebase = (uid, lat, lng, address, accuracy = null) => {
  if (!window.navifyDb || !uid) return;
  
  // VALIDATION: Check coordinates before saving
  if (!window.isValidCoordinate(lat, lng)) {
    console.error('❌ Invalid coordinates, not saving to Firebase:', lat, lng);
    return;
  }
  
  // Calculate location quality score (0-100)
  // Better accuracy = higher quality
  let qualityScore = 100;
  if (accuracy) {
    // Accuracy typically 5-30m for good GPS
    // If accuracy > 50m, reduce quality
    if (accuracy > 50) {
      qualityScore = Math.max(20, 100 - (accuracy - 50) * 2);
    } else if (accuracy > 30) {
      qualityScore = 100 - (accuracy - 30) * 0.5;
    }
  }
  
  const locationData = {
    lat: lat,
    lng: lng,
    address: address || 'Current location',
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    isSharing: true,
    // Accuracy in meters (used by getNearbyUsers for filtering)
    accuracy: Math.round(accuracy || 20),
    // Quality score helps other devices decide whether to use this location
    qualityScore: Math.max(0, Math.min(100, Math.round(qualityScore)))
  };
  
  console.log(`📍 Sharing location with quality=${locationData.qualityScore}, accuracy=${locationData.accuracy}m`);
  
  return window.navifyDb.ref(`users/${uid}/location`).set(locationData);
};

// Stop sharing location
window.stopSharingLocation = (uid) => {
  if (!window.navifyDb || !uid) return;
  return window.navifyDb.ref(`users/${uid}/location`).remove();
};

// Listen to friend's location in real-time WITH ACCURACY VALIDATION
window.listenToFriendLocation = (friendUid, callback) => {
  if (!window.navifyDb || !friendUid) return () => {};
  
  let previousLocation = null; // Track previous location for outlier detection
  const ref = window.navifyDb.ref(`users/${friendUid}/location`);
  
  ref.on('value', (snapshot) => {
    const location = snapshot.val();
    
    // VALIDATION: Comprehensive location data check
    if (location && window.isValidLocationData(location)) {
      // OUTLIER DETECTION: Check for impossible jumps (teleportation)
      if (previousLocation && window.detectLocationOutlier(location, previousLocation)) {
        console.warn(`❌ OUTLIER DETECTED for friend ${friendUid}: Impossible jump detected (>252 km/h)`);
        console.warn(`   Previous:`, previousLocation);
        console.warn(`   Current:`, location);
        // Reject this location update, keep using previous
        return;
      }
      
      // VALID: Location passed all checks
      previousLocation = location;
      if (callback) callback(location);
      console.log(`✓ Friend ${friendUid} location updated:`, { lat: location.lat, lng: location.lng, accuracy: location.accuracy });
    } else if (location) {
      console.warn(`⚠️ Friend location ${friendUid} failed validation - stale/inaccurate:`, location);
      // Do not update UI with invalid location - prevents showing wrong distances
    }
  });
  
  return () => ref.off();
};

// Get nearby users within specified radius (km) WITH ACCURACY FILTERING & CACHING
// Cache for nearby users to avoid redundant Firebase queries
window.nearbyUsersCache = { users: [], timestamp: 0, cacheDurationMs: 2000 };

// Advanced outlier detection for suspicious locations
window.detectLocationOutlier = (current, previous, maxSpeedMps = 70) => {
  // max 252 km/h (maxSpeedMps * 3.6)
  if (!previous) return false; // No previous data, not an outlier
  
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const lat1 = toRad(previous.lat);
  const lat2 = toRad(current.lat);
  const deltaLat = toRad(current.lat - previous.lat);
  const deltaLng = toRad(current.lng - previous.lng);
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = EARTH_RADIUS_M * c;
  
  // Assume ~5 second interval between updates
  const speedMps = distanceMeters / 5;
  
  // Mark as outlier if moving unreasonably fast (>252 km/h)
  if (speedMps > maxSpeedMps) {
    console.warn(`⚠️ Location jump detected: ${speedMps.toFixed(1)} m/s (~${(speedMps * 3.6).toFixed(0)} km/h)`);
    return true;
  }
  
  return false;
};

window.getNearbyUsers = async (myLat, myLng, radiusKm = 5) => {
  if (!window.navifyDb) return [];
  
  // CACHE CHECK: Return cached results if fresh
  const cacheAge = Date.now() - window.nearbyUsersCache.timestamp;
  if (cacheAge < window.nearbyUsersCache.cacheDurationMs && window.nearbyUsersCache.users.length > 0) {
    console.log(`📦 Using cached nearby users (${cacheAge}ms old)`);
    return window.nearbyUsersCache.users;
  }
  
  const snapshot = await window.navifyDb.ref('users').once('value');
  const users = [];
  const currentUserId = firebase.auth().currentUser?.uid;
  
  snapshot.forEach((child) => {
    const userData = child.val();
    const userLoc = userData?.location;
    
    // Check that user is sharing and not self
    if (!userLoc || !userLoc.isSharing || child.key === currentUserId) {
      return;
    }
    
    // Comprehensive validation
    if (!window.isValidLocationData(userLoc)) {
      console.warn(`⏭️ Skipping user ${child.key}: invalid/stale location`);
      return;
    }
    
    // Calculate distance with high precision
    try {
      const distance = window.haversineKm({ lat: myLat, lng: myLng }, { lat: userLoc.lat, lng: userLoc.lng });
      
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
          accuracy: userLoc.accuracy || null,
          lastSeen: userData?.lastSeen || Date.now(),
          verified: userData?.verified || false
        });
      }
    } catch (err) {
      console.error(`❌ Distance calculation failed for user ${child.key}:`, err);
    }
  });
  
  // Sort by distance (nearest first)
  const sorted = users.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  
  // Update cache
  window.nearbyUsersCache = {
    users: sorted,
    timestamp: Date.now(),
    cacheDurationMs: 2000
  };
  
  console.log(`✓ Nearby users scan complete: ${sorted.length} valid users within ${radiusKm}km`);
  return sorted;
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

// Calculate bearing (direction) from one point to another
// Returns bearing in degrees (0-360) where 0/360 = North, 90 = East, 180 = South, 270 = West
window.calculateBearing = (from, to) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const toDeg = (rad) => rad * (180 / Math.PI);
  
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  return bearing;
};

// Convert bearing to compass direction with arrow emoji
window.getBearingArrow = (bearing) => {
  // Returns emoji arrow pointing in direction
  const directions = ['⬇️', '↙️', '⬅️', '↖️', '⬆️', '↗️', '➡️', '↘️'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Convert bearing to compass direction name
window.getBearingDirection = (bearing) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return dirs[index];
};

// Enhanced Haversine distance calculation
window.haversineKm = (from, to) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => deg * (Math.PI / 180);
  
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ========== ADVANCED LOCATION ACCURACY IMPROVEMENTS ==========

// High-precision coordinate validation
window.isValidCoordinate = (lat, lng) => {
  // Check if lat/lng are numbers and within valid ranges
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false; // Check for Infinity
  return true;
};

// Check if location data is fresh (not stale) - stricter for accuracy
window.isLocationFresh = (timestamp, maxAgeMs = 30000) => {
  if (!timestamp) return false;
  const age = Date.now() - timestamp;
  // More aggressive stale data filtering for accuracy (30s instead of 45s)
  return age < maxAgeMs;
};

// Filter location by GPS accuracy (ignore weak accuracy readings) - stricter for accuracy
window.isAccurateLocation = (accuracy, maxAccuracyM = 50) => {
  // Only accept GPS readings with accuracy better than 50m (instead of 100m)
  if (!accuracy || accuracy > maxAccuracyM) return false;
  // Reject extremely good readings that might be outliers
  if (accuracy < 1) return false;
  return true;
};

// Comprehensive location validation
window.isValidLocationData = (location, maxAccuracyM = 100) => {
  if (!location) return false;
  
  const { lat, lng, accuracy, timestamp } = location;
  
  // Check coordinate validity
  if (!window.isValidCoordinate(lat, lng)) {
    console.warn('❌ Invalid coordinates:', lat, lng);
    return false;
  }
  
  // Check timestamp freshness
  if (!window.isLocationFresh(timestamp)) {
    console.warn('⏱️ Location data too old:', Date.now() - timestamp, 'ms');
    return false;
  }
  
  // Check GPS accuracy if available
  if (accuracy && !window.isAccurateLocation(accuracy, maxAccuracyM)) {
    console.warn('📍 Low GPS accuracy (±' + accuracy + 'm), ignoring');
    return false;
  }
  
  return true;
};
