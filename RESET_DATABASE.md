# Database Reset Instructions

## Overview
This guide explains how to reset the Navify app database and clear all user data to allow fresh signups.

## Method 1: Clear Browser Data (Quickest)

### For Users
1. Visit: https://mattleapertree-droid.github.io/NAVIFYBUDDY/
2. Clear browser cache and localStorage:
   - **Chrome/Edge**: Ctrl+Shift+Delete → Select "All time" → Check "Cookies and other site data" + "Cached images and files" → Clear data
   - **Firefox**: Ctrl+Shift+Delete → Select "Everything" → Clear Now
   - **Safari**: Develop → Empty Web Storage

### For Development (Clear localStorage from Console)
```javascript
// Open browser console (F12 on home page)
localStorage.clear();
location.reload();
// Now you'll be back at login page
```

## Method 2: Reset Firebase Realtime Database

### In Firebase Console:
1. Go to: https://console.firebase.google.com/project/navify-703b8/database
2. Click on your database (Realtime Database)
3. Click **Rules** tab
4. Replace with:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. Click **Publish**
6. Select all data in the database
7. Delete it or use the clear data script below

### Using Firebase CLI (Advanced)
```bash
# Install Firebase CLI if not already
npm install -g firebase-tools

# Login
firebase login

# Clear database
firebase database:remove /users --project navify-703b8
```

## Method 3: Automated Reset via Code

Add this to your browser console while on the home page:

```javascript
// Clear all Navify data
localStorage.clear();

// Optional: Also clear Firebase data (requires auth)
if (window.navifyDb && window.currentUser) {
  window.navifyDb.ref('users').remove()
    .then(() => {
      alert('Database cleared!');
      window.location.href = '../index.html';
    })
    .catch(err => console.error('Clear failed:', err));
}
```

## What Gets Reset?

### localStorage
- `navify-user` - Current user session
- `navify-contacts-v2` - Saved contacts
- `navify-live-v2` - Location data
- `navify-name-v2` - User name
- `navify-avatar-v2` - Avatar selection
- `navify-guide-target` - Saved destination
- `navify-share-on-v2` - Location sharing state
- `navify-saved-email` - Remember Me email
- `_dev_otp` - Test OTP code

### Firebase Realtime Database
- `users/{uid}/location` - Location data
- `users/{uid}/contacts` - Contact list
- `users/{uid}/phone` - Phone data
- `users/{uid}/lastSeen` - Last seen timestamp

## After Reset

1. All localStorage will be cleared
2. Users will be back at login page (index.html)
3. New signups can create accounts
4. Phone verification via SMS OTP will work
5. No duplicate account issues

## Testing Fresh Signup

1. Clear data using Method 1
2. Visit: https://mattleapertree-droid.github.io/NAVIFYBUDDY/
3. Click **Sign Up**
4. Fill form with new details
5. Enter phone number (e.g., 09123456789)
6. Get OTP code from browser console: `localStorage.getItem('_dev_otp')`
7. Enter OTP and complete signup
8. Sign back in with email/password
9. See "Signed in: [Your Name]" on home page

## Troubleshooting

### Still logged in after reset?
- Make sure you cleared ALL browser storage
- Try incognito/private window
- Check if iCloud/Sync is restoring data (Safari)

### Can't signup?
- Clear cache completely (Ctrl+Shift+Delete for full time range)
- Check browser console for errors (F12)
- Make sure Firebase is initialized (check network tab)

### Firebase data still there?
- Verify rules are set to allow writes
- Try Method 3 with Firebase CLI
- Manually delete from Firebase Console

## Production Notes

⚠️ **IMPORTANT**: In production, implement proper:
- Database backups before resets
- Admin authorization for resets
- Audit logging of deleted data
- GDPR compliance checks
- User notification of data deletion

---

**Last Updated:** March 10, 2026  
**For Support:** Check app logs or Firebase console for errors
