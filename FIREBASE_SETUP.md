# Firebase Setup Guide for Navify

## Overview
Navify uses Firebase for authentication, real-time database, and file storage. This guide helps you set up and use Firebase with your Navify app.

## Firebase Project: `navify-703b8`

Your Firebase configuration is already embedded in `auth/firebase-init.js`.

## Authentication Features

### Sign-Up Requirements
- **Email**: Valid email address
- **Password**: Minimum 8 characters
- **Phone Number**: Required in Philippine format (09XXXXXXXXX or +639XXXXXXXXX)
- **Real Name**: Full name required
- **Terms**: Must agree to Terms & Privacy

### Phone Verification
When users sign up, their phone number is:
1. Validated against Philippine phone format
2. Formatted as international number (+63...)
3. Stored in the database under `users/{uid}/phone/`
4. Marked as verified upon account creation

## Firebase Database Structure

```
navify-703b8 (Realtime Database)
├── users/
│   ├── {uid}/
│   │   ├── lastSeen: timestamp
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── verified: boolean
│   │   ├── createdAt: timestamp
│   │   ├── phone/
│   │   │   ├── number: string (formatted +63XXXXXXXXX)
│   │   │   ├── verified: boolean
│   │   │   └── verifiedAt: timestamp
│   │   ├── contacts/
│   │   │   └── {contactId}/
│   │   │       ├── id: string
│   │   │       ├── name: string
│   │   │       ├── phone: string (formatted)
│   │   │       ├── email: string
│   │   │       └── createdAt: timestamp
│   │   ├── savedPlaces/
│   │   │   └── {placeId}/
│   │   │       ├── id: number (timestamp)
│   │   │       ├── name: string
│   │   │       ├── lat: number
│   │   │       ├── lng: number
│   │   │       ├── type: string (home/work/favorite/custom)
│   │   │       └── savedAt: timestamp
│   │   └── trustedCircle/
│   │       └── {contactId}: boolean (shared)
```

## How to Set Up Firebase Console

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select project `navify-703b8`

### 2. Enable Authentication Methods
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password** ✓
- Enable **Google** (optional but recommended)

### 3. Set Up Realtime Database
- Go to **Realtime Database** → **Create Database**
- Choose **Asia Pacific (Singapore)** region
- Start in **Test Mode** (for development)

### 4. Set Up Firestore Rules (for production)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('users').child($uid).child('trustedCircle').child(auth.uid).exists()",
        ".write": "auth.uid === $uid",
        "contacts": {
          ".read": "auth.uid === $uid",
          ".write": "auth.uid === $uid"
        },
        "savedPlaces": {
          ".read": "auth.uid === $uid",
          ".write": "auth.uid === $uid"
        },
        "phone": {
          ".read": "auth.uid === $uid",
          ".write": "auth.uid === $uid"
        }
      }
    }
  }
}
```

### 5. Set Up Cloud Storage
- Go to **Cloud Storage** → **Create bucket**
- Region: `asia-southeast1` (Singapore)
- Use default settings
- Set storage rules:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{filename} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

## Features Implemented

### ✅ Persistent User Sessions
- User stays logged in when app refreshes
- Last seen timestamp updates in real-time database

### ✅ Phone Number Validation
- Philippine format validation on sign-up
- Automatic formatting (+63...)
- Stored in database for contact purposes

### ✅ Contact Management
- Add contacts with phone/email
- Contacts synced to Firebase when user is logged in
- Contacts deleted from both localStorage and Firebase

### ✅ Place Saving
- Save favorite places (Home, Work, etc.)
- Firebase sync when logged in
- Load places from both localStorage and Firebase

### ✅ Transportation Modes
- Walk (4.8 km/h)
- Car (40 km/h)
- Transit (25 km/h)
- Auto-calculates ETA based on selected mode

## How to Use Key Features

### Sign Up New User
1. Click "Sign Up" button
2. Enter full name
3. Enter email
4. Enter phone number (09XXXXXXXXX format)
5. Enter password (8+ characters)
6. Check agreement box
7. Click "Create account & Verify Phone"
8. Check email for verification link

### Add Trusted Contact
1. Click "+" button
2. Enter contact name
3. Enter phone (09XXXXXXXXX or +639XXXXXXXXX)
4. Enter email (optional)
5. Click "Save Contact"
6. Contact saved to both app and Firebase

### Save a Place
1. Set a destination on map
2. Click "💾 Save This Place"
3. Enter name (e.g., "My Office")
4. Click OK
5. Place saved to "📌 My Places" for quick access

### Select Transport Mode
1. Click "☰" (menu) button
2. Under "Default Transport Mode" select:
   - 🚶 Walk
   - 🚗 Car
   - 🚌 Transit
3. Click "Save"
4. ETA and route descriptions update automatically

## Troubleshooting

### Users Can't Sign Up
- Check Firebase Authentication is enabled
- Verify email format is correct
- Confirm phone format is 09XXXXXXXXX or +639XXXXXXXXX

### Contacts Not Syncing
- Verify user is logged in (check localStorage for 'navify-user')
- Check Firebase Realtime Database rules allow writes
- Check network connectivity

### Places Not Saving
- Must be logged in to save to Firebase
- localStorage backup always works
- Check Firebase Storage bucket exists and rules allow writes

### Phone Verification Not Working
- Use format: 09XXXXXXXXX or +639XXXXXXXXX (with country code)
- Check `validatePhoneNumber()` in js/app.js
- Philippine numbers only (09... or +639...)

## Testing Checklist

- [ ] User can create account with phone verification
- [ ] User stays logged in after refresh
- [ ] Can add contacts with phone/email validation
- [ ] Contacts appear in Trusted Circle
- [ ] Can save favorite places
- [ ] Saved places appear in "My Places"
- [ ] Can delete contacts and places
- [ ] ETA changes based on transport mode
- [ ] Changes sync to Firebase when logged in
- [ ] Support contact (mattymiah10@gmail.com / +63 976-629-9248) works

## Support Contact
**Email**: mattymiah10@gmail.com
**Phone**: +63 976-629-9248 (verified working)

---
Last Updated: March 2026
Firebase Project: navify-703b8
