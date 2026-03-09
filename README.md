# Navify - Your Travel Buddy 🗺️

A modern, beautiful travel companion web app that helps you navigate safely, track your location, and stay connected with your trusted circle.

## Features ✨

- **Live Location Tracking**: Real-time GPS tracking with smooth coordination
- **Route Planning**: Interactive maps with walking route guidance (Leaflet + OpenStreetMap)
- **Trusted Circle**: Share your location with family and friends
- **Favorite Places**: Quick shortcuts to your most-visited destinations
- **Trip Ideas**: Curated suggestions for beaches, cities, food spots, and study areas
- **User Profiles**: Customizable avatars and display names
- **Dark/Light Mode**: Beautiful theme toggle
- **Offline-Friendly**: Works offline for basic features
- **Firebase Auth**: Email/password and social login support
- **Mobile Responsive**: Optimized for all device sizes

## Project Structure 📁

```
navify-app/
├── index.html           # Login/landing page
├── pages/               # Application pages
│   ├── home.html       # Main app dashboard
│   ├── guide.html      # Walking route guide
│   └── support.html    # Support center
├── css/
│   └── app.css         # Main stylesheet
├── js/
│   ├── app.js          # Main application logic
│   └── theme.js        # Theme switching logic
├── auth/               # Firebase authentication
│   ├── firebase-init.js
│   ├── firebase-auth.js
│   ├── sign-in.js
│   ├── sign-up.js
│   └── ...
├── assets/             # Images and avatars
│   └── *.png
└── package.json        # Project metadata
```

## Getting Started 🚀

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Firebase account for authentication

### Installation

1. **Clone or download the project**
```bash
git clone https://github.com/yourusername/navify-app.git
cd navify-app
```

2. **Open in browser**
- Local: Run a local server (see below)
- Online: Deploy to GitHub Pages or any static hosting

### Running Locally

**Using Python** (Python 3):
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Using Node.js** (with http-server):
```bash
npm install -g http-server
http-server .
# Open http://localhost:8080
```

**Using VS Code Live Server**:
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

## Configuration 🔧

### Firebase Setup (Optional)

To enable authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Get your config from Project Settings
4. Update `auth/firebase-init.js`:
```javascript
window.NAVIFY_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... rest of config
};
```

## Usage 💡

### For End Users

1. **Sign In**: Create an account or continue as guest
2. **Detect Location**: Click "Detect My Location" to enable GPS
3. **Set Destination**: Search for a place and set it as your destination
4. **View Route**: Click "Guide Me There" for turn-by-turn directions
5. **Add Contacts**: Click "+" to add trusted contacts to your circle
6. **Share Location**: Toggle "Share: On/Off" to share your live location

### For Developers

```javascript
// Main app initialization happens in pages/home.html
// JavaScript loads in this order:
// 1. css/app.css       - Styles
// 2. theme.js          - Theme switching
// 3. Leaflet & routing - Map libraries
// 4. app.js            - Main functionality

// Key global variables:
map              // Leaflet map instance
userMarker       // Current user location marker
destinationMarker // Target location marker
selectedDestination // Currently selected destination
sharingOn        // Location sharing status
```

## Features Walkthrough 🎯

### Location Tracking
- Geolocation API with high accuracy
- Smooth coordinate smoothing to reduce noise
- Automatic reverse geocoding to show location names
- Display GPS accuracy indicator

### Route Planning
- Click map to set destination
- Auto-routing with Leaflet Routing Machine
- Walking time estimation (4.8 km/h) 
- Distance calculation using Haversine formula
- Real-time route updates as you move

### Trusted Circle
- Add unlimited contacts
- Share location with selected people
- Call, text, or email contacts directly
- View contact distance from app
- Contact location mapping

### Trip Planning
- Pre-loaded categories (Beaches, Cities, Food, Study)
- Image previews and ratings
- Contact hours and information
- One-tap navigation

## API & Services Used 📡

- **[OpenStreetMap](https://www.openstreetmap.org/)**: Map data
- **[Leaflet](https://leafletjs.com/)**: Interactive maps
- **[Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)**: Route planning
- **[Nominatim](https://nominatim.org/)**: Geocoding/reverse geocoding
- **[Firebase](https://firebase.google.com/)**: Authentication (optional)
- **[Unsplash](https://unsplash.com/)**: Trip images

## Browser Support 🌐

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting 🔍

### Location not detected?
- Check browser location permissions
- Ensure HTTPS (except localhost)
- Try different browser
- Close and reopen the app

### Map not loading?
- Verify internet connection
- Check browser console for errors
- Ensure OpenStreetMap is accessible
- Try clearing cache

### Routes not displaying?
- Supported in selected regions
- Destination must be accessible by road
- Try a different destination
- Check Nominatim service status

## Performance Tips ⚡

- Enable location caching in browser
- Use dark mode on OLED devices
- Close unused tabs
- Clear browser cache periodically
- Use on 4G+ for best experience

## Privacy & Security 🔒

- ✅ No tracking analytics (non-invasive)
- ✅ Local storage only (no backend)
- ✅ Optional Firebase authentication
- ✅ HTTPS recommended for production
- ✅ Shared locations are only in local storage

## Deployment 🌍

### GitHub Pages (Free)
```bash
# Create gh-pages branch and push
git subtree push --prefix . origin gh-pages
```

### Vercel (Free)
```bash
npm i -g vercel
vercel
```

### Netlify (Free)
```bash
npm i -g netlify-cli
netlify deploy
```

### Traditional Hosting
- Upload contents to any web server
- Ensure HTTPS enabled
- Set proper CORS headers if needed

## Contributing 🤝

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License 📄

This project is open source and available under the MIT License.

## Support 💬

- Email: support@navify.app
- Issues: [GitHub Issues](https://github.com/yourusername/navify-app/issues)
- Documentation: See this README and inline code comments

## Roadmap 🗺️

- [ ] Offline map caching
- [ ] Multiple language support
- [ ] Real-time traffic predictions
- [ ] Public transit integration
- [ ] Emergency alert system
- [ ] Community safety reports
- [ ] Advanced trip planning
- [ ] Integration with calendar apps

## Credits 👏

Built with passion for safe travels and connected communities.

---

**Happy traveling with Navify!** 🚀
