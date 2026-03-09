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
  if (!validatePhoneNumber(phoneNumber)) {
    return Promise.reject('Invalid phone number format');
  }
  const formatted = formatPhoneNumber(phoneNumber);
  return firebase.database().ref('users/' + userId + '/phone').set({
    number: formatted,
    verified: true,
    verifiedAt: Date.now()
  });
  } catch (err) {
    console.error('Failed to initialize Firebase for Navify:', err);
  }
})();
