const avatarBtn = document.getElementById('avatarBtn');
const avatarModal = document.getElementById('avatarModal');
const avatarGrid = document.getElementById('avatarGrid');
const avatarImg = document.getElementById('avatarImg');
const avatarUpload = document.getElementById('avatarUpload');

const transportCard = document.getElementById('transportCard');
const categoryCard = document.getElementById('categoryCard');
const transportModal = document.getElementById('transportModal');
const categoryModal = document.getElementById('categoryModal');
const transportList = document.getElementById('transportList');
const categoryGrid = document.getElementById('categoryGrid');
const tripPlaces = document.getElementById('tripPlaces');

const walkRouteBtn = document.getElementById('walkRouteBtn');
const detectLocationBtn = document.getElementById('detectLocationBtn');
const locationInput = document.getElementById('locationInput');
const destinationInput = document.getElementById('destinationInput');
const destinationSuggestions = document.getElementById('destinationSuggestions');
const mapDescription = document.getElementById('mapDescription');
const mapEl = document.getElementById('map');
const etaLabel = document.getElementById('etaLabel');
const safetyNote = document.getElementById('safetyNote');
const suggestList = document.getElementById('suggestList');
const suggestionsHint = document.getElementById('suggestionsHint');

const contactList = document.getElementById('contactList');
const liveStatus = document.getElementById('liveStatus');
const shareToggle = document.getElementById('shareToggle');
const openShareModal = document.getElementById('openShareModal');
const shareModal = document.getElementById('shareModal');
const contactNameInput = document.getElementById('contactNameInput');
const contactPhoneInput = document.getElementById('contactPhoneInput');
const contactEmailInput = document.getElementById('contactEmailInput');
const addContactBtn = document.getElementById('addContactBtn');

const contactModal = document.getElementById('contactModal');
const contactModalTitle = document.getElementById('contactModalTitle');
const contactModalSubtitle = document.getElementById('contactModalSubtitle');
const contactDetailBox = document.getElementById('contactDetailBox');
const callContactBtn = document.getElementById('callContactBtn');
const textContactBtn = document.getElementById('textContactBtn');
const emailContactBtn = document.getElementById('emailContactBtn');
const locateContactBtn = document.getElementById('locateContactBtn');
const shareMyLocationBtn = document.getElementById('shareMyLocationBtn');
const deleteContactBtn = document.getElementById('deleteContactBtn');

const menuBtn = document.getElementById('menuBtn');
const prefsModal = document.getElementById('prefsModal');
const nameInput = document.getElementById('nameInput');
const savePrefsBtn = document.getElementById('savePrefsBtn');
const userName = document.getElementById('userName');

const notifBar = document.getElementById('notifBar');
const statusText = document.getElementById('statusText');

const CONTACT_KEY = 'navify_contacts_v2';
const LIVE_KEY = 'navify_live_v2';
const NAME_KEY = 'navify_name_v2';
const AVATAR_KEY = 'navify_avatar_v2';
const DESTINATION_KEY = 'navify-guide-target';
const SHARE_STATE_KEY = 'navify_share_on_v2';

let map = null;
let userMarker = null;
let destinationMarker = null;
let routingControl = null;
let watchId = null;
let selectedDestination = null;
let currentContactId = null;
let sharingOn = localStorage.getItem(SHARE_STATE_KEY) === 'true';
let lastUserCoords = null;
let lastReadableLocation = '';
let lastReverseLookupAt = 0;
let lastRouteRefreshAt = 0;

// Friend location tracking
let friendMarkers = {};
let friendListeners = {};
let nearbyUsers = [];
let voiceCallActive = null;

const avatarOptions = [
  'assets/1.png',
  'assets/2.png',
  'assets/3.png',
  'assets/4.png',
  'assets/5.png',
  'assets/6.png'
];

const favoritePlaces = [
  { name: 'Home', label: 'Saved home address', lat: 14.5995, lng: 120.9842 },
  { name: 'School', label: 'Saved school', lat: 14.676, lng: 121.0437 },
  { name: 'SM Mall of Asia', label: 'Pasay City', lat: 14.535, lng: 120.982 },
  { name: 'Rizal Park', label: 'Manila', lat: 14.5825, lng: 120.9797 }
];

const tripIdeaSets = {
  Beaches: [
    {
      name: 'Boracay White Beach',
      location: 'Aklan',
      hours: 'Open all day',
      rating: '4.8',
      lat: 11.9674,
      lng: 121.9248,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Alona Beach',
      location: 'Bohol',
      hours: 'Best during daytime',
      rating: '4.7',
      lat: 9.5489,
      lng: 123.7648,
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80'
    }
  ],
  Cities: [
    {
      name: 'Intramuros',
      location: 'Manila',
      hours: '8:00 AM - 5:00 PM',
      rating: '4.7',
      lat: 14.5896,
      lng: 120.9747,
      image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Ayala Triangle',
      location: 'Makati',
      hours: 'Open most of the day',
      rating: '4.6',
      lat: 14.5564,
      lng: 121.0244,
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80'
    }
  ],
  Food: [
    {
      name: 'Binondo Food Trip',
      location: 'Manila',
      hours: 'Best in the morning to evening',
      rating: '4.7',
      lat: 14.6011,
      lng: 120.9747,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
    }
  ],
  Study: [
    {
      name: 'National Library Area',
      location: 'Manila',
      hours: 'Business hours',
      rating: '4.4',
      lat: 14.582,
      lng: 120.978,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80'
    }
  ]
};

const suggestionSets = {
  manila: ['Intramuros', 'Rizal Park', 'National Museum', 'SM Mall of Asia'],
  cebu: ['Magellan\'s Cross', 'Ayala Center Cebu', 'IT Park', 'Temple of Leah'],
  davao: ['People\'s Park', 'SM Lanang', 'Matina Town Square', 'Roxas Night Market'],
  default: ['Police assistance desk', 'Barangay hall', 'Transport terminal', '24/7 convenience stop']
};

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getContacts() {
  return JSON.parse(localStorage.getItem(CONTACT_KEY) || '[]');
}

function setContacts(list) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(list));
}

function getLiveData() {
  return JSON.parse(localStorage.getItem(LIVE_KEY) || '{}');
}

function setLiveData(data) {
  localStorage.setItem(LIVE_KEY, JSON.stringify(data));
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.modal-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    const selector = btn.getAttribute('data-close');
    if (!selector) return;
    closeModal(document.querySelector(selector));
  });
});

document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

function debounce(fn, delay = 400) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function metersBetween(a, b) {
  return haversineKm(a, b) * 1000;
}

function smoothCoords(prev, next, factor = 0.35) {
  if (!prev) return next;
  return {
    lat: prev.lat + (next.lat - prev.lat) * factor,
    lng: prev.lng + (next.lng - prev.lng) * factor
  };
}

function estimateEtaMinutes(distanceKm, transportMode = 'walk') {
  const speeds = {
    walk: 4.8,      // km/h
    car: 40,        // km/h (city driving average)
    transit: 25     // km/h (bus/jeepney average)
  };
  const kmh = speeds[transportMode] || speeds.walk;
  return Math.round((distanceKm / kmh) * 60);
}

// Transportation mode selection
window.currentTransportMode = localStorage.getItem('navify_transport_mode') || 'walk';

function getTransportIcon(mode) {
  const icons = { walk: '🚶', car: '🚗', transit: '🚌' };
  return icons[mode] || '🚶';
}

function setTransportMode(mode) {
  if (!['walk', 'car', 'transit'].includes(mode)) return;
  window.currentTransportMode = mode;
  localStorage.setItem('navify_transport_mode', mode);
  
  // Refresh route if one exists
  if (selectedDestination) {
    drawRoute(selectedDestination.lat, selectedDestination.lng);
  }
}

// Place saving functionality
const PLACES_KEY = 'navify_saved_places';
const PLACES_FIREBASE_KEY = 'users';

function getSavedPlaces() {
  const stored = localStorage.getItem(PLACES_KEY);
  return stored ? JSON.parse(stored) : [];
}

function savePlace(name, lat, lng, type = 'custom') {
  const places = getSavedPlaces();
  const place = {
    id: Date.now(),
    name: name,
    lat: lat,
    lng: lng,
    type: type,
    savedAt: Date.now()
  };
  places.push(place);
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
  
  // Save to Firebase if user is logged in
  if (window.currentUser && window.navifyDb) {
    window.navifyDb.ref(`users/${window.currentUser.uid}/savedPlaces/${place.id}`).set(place);
  }
  
  return place;
}

function deletePlace(placeId) {
  const places = getSavedPlaces().filter(p => p.id !== placeId);
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
  
  // Remove from Firebase if user is logged in
  if (window.currentUser && window.navifyDb) {
    window.navifyDb.ref(`users/${window.currentUser.uid}/savedPlaces/${placeId}`).remove();
  }
}

function renderSavedPlaces() {
  const places = getSavedPlaces();
  if (!tripPlaces) return;
  
  tripPlaces.innerHTML = '';
  places.forEach(place => {
    const placeBtn = document.createElement('div');
    placeBtn.className = 'suggestion-card';
    placeBtn.innerHTML = `
      <div class="sugg-title">${place.name}</div>
      <div class="sugg-meta">${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button class="small-btn" onclick="setDestinationAndRoute(${place.lat}, ${place.lng}, '${place.name}')">Go</button>
        <button class="small-btn" onclick="deletePlace(${place.id})">Delete</button>
      </div>
    `;
    tripPlaces.appendChild(placeBtn);
  });
}

function sanitizePhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '');
}

function loadName() {
  const saved = localStorage.getItem(NAME_KEY) || 'Traveler';
  userName.textContent = saved;
  if (nameInput) nameInput.value = saved;
}

function loadAvatar() {
  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved) {
    avatarImg.src = saved;
  } else if (avatarOptions[0]) {
    avatarImg.src = avatarOptions[0];
  }
}

function renderAvatarOptions() {
  if (!avatarGrid) return;
  avatarGrid.innerHTML = '';

  avatarOptions.forEach((src) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option';
    btn.type = 'button';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Avatar option';

    btn.appendChild(img);
    btn.addEventListener('click', () => {
      avatarImg.src = src;
      localStorage.setItem(AVATAR_KEY, src);
      closeModal(avatarModal);
    });

    avatarGrid.appendChild(btn);
  });
}

function setStatus(text) {
  if (statusText) statusText.textContent = text;
}

function initMap() {
  if (!mapEl || map || typeof L === 'undefined') return;

  map = L.map(mapEl, { zoomControl: true }).setView([14.5995, 120.9842], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);

  map.on('click', async (e) => {
    if (mapDescription) mapDescription.textContent = 'Getting place name...';

    const target = await reverseGeocode(e.latlng.lat, e.latlng.lng);

    selectedDestination = {
      lat: target.lat,
      lng: target.lng,
      label: target.label,
      address: target.fullAddress
    };

    localStorage.setItem(DESTINATION_KEY, JSON.stringify(selectedDestination));
    setDestinationMarker(target.lat, target.lng, target.label);

    if (destinationInput) {
      destinationInput.value = target.fullAddress;
    }

    if (userMarker) {
      drawRoute(target.lat, target.lng);
    }

    updateSuggestions();
    mapDescription.textContent = `Destination pinned: ${target.label}`;
  });
}

function setDestinationMarker(lat, lng, label) {
  if (!map) return;

  if (!destinationMarker) {
    destinationMarker = L.marker([lat, lng]).addTo(map);
  } else {
    destinationMarker.setLatLng([lat, lng]);
  }

  destinationMarker.bindPopup(label || 'Destination');
}

function updateEtaLabel(from, to) {
  if (!etaLabel) return;
  if (!from || !to) {
    etaLabel.textContent = 'ETA: --';
    return;
  }

  const distance = haversineKm(from, to);
  const eta = estimateEtaMinutes(distance, window.currentTransportMode);
  const modeIcon = getTransportIcon(window.currentTransportMode);
  etaLabel.textContent = `ETA: ${Math.round(eta)} min ${modeIcon}`;
}

function drawRoute(destLat, destLng) {
  if (!map || !L.Routing || !userMarker) return;

  const from = userMarker.getLatLng();
  const to = { lat: destLat, lng: destLng };

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(from.lat, from.lng),
      L.latLng(destLat, destLng)
    ],
    routeWhileDragging: false,
    show: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker() {
      return null;
    },
    lineOptions: {
      styles: [{ color: '#7bf1ff', opacity: 0.95, weight: 6 }]
    }
  }).addTo(map);

  routingControl.on('routesfound', (e) => {
    const route = e.routes && e.routes[0];
    const distanceKm = route?.summary?.totalDistance
      ? route.summary.totalDistance / 1000
      : haversineKm({ lat: from.lat, lng: from.lng }, to);

    const eta = estimateEtaMinutes(distanceKm, window.currentTransportMode);
    const modeLabels = { walk: 'walk', car: 'drive', transit: 'transit' };
    const modeLabel = modeLabels[window.currentTransportMode] || 'walk';
    
    if (safetyNote) {
      safetyNote.textContent = `Route ready. Approx. ${Math.round(eta)} min ${modeLabel} • ${distanceKm.toFixed(1)} km`;
    }

    updateEtaLabel({ lat: from.lat, lng: from.lng }, to);
  });

  routingControl.on('routingerror', () => {
    if (safetyNote) {
      safetyNote.textContent = 'Could not find road route. Try another nearby place.';
    }
    updateEtaLabel(null, null);
  });
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();

    const label =
      data.name ||
      data.address?.road ||
      data.address?.suburb ||
      data.address?.village ||
      data.address?.city ||
      'Selected place';

    return {
      lat,
      lng,
      label,
      fullAddress: data.display_name || label
    };
  } catch {
    return {
      lat,
      lng,
      label: 'Selected place',
      fullAddress: `Pinned location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
    };
  }
}

async function searchPlaces(query) {
  if (!query || query.trim().length < 3) {
    renderDestinationSuggestions([]);
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=ph&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Search failed');

    const results = await res.json();
    const places = results.map((item) => ({
      label: item.display_name.split(',')[0] || 'Place',
      subtitle: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon)
    }));

    renderDestinationSuggestions(places);
  } catch {
    renderDestinationSuggestions([]);
  }
}

function renderDestinationSuggestions(items) {
  if (!destinationSuggestions) return;
  destinationSuggestions.innerHTML = '';

  if (!items.length) {
    destinationSuggestions.classList.remove('show');
    return;
  }

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'destination-option';
    el.innerHTML = `
      <div class="destination-option-title">${item.label}</div>
      <div class="destination-option-sub">${item.subtitle}</div>
    `;

    el.addEventListener('click', () => {
      selectedDestination = {
        lat: item.lat,
        lng: item.lng,
        label: item.label,
        address: item.subtitle
      };

      localStorage.setItem(DESTINATION_KEY, JSON.stringify(selectedDestination));
      destinationInput.value = item.subtitle;
      setDestinationMarker(item.lat, item.lng, item.label);
      map.setView([item.lat, item.lng], 15, { animate: true });

      if (userMarker) {
        drawRoute(item.lat, item.lng);
      }

      destinationSuggestions.classList.remove('show');
      updateSuggestions();
      mapDescription.textContent = `Destination set to ${item.label}`;
    });

    destinationSuggestions.appendChild(el);
  });

  destinationSuggestions.classList.add('show');
}

const debouncedSearchPlaces = debounce(searchPlaces, 450);

function updateSuggestions() {
  const value = (destinationInput?.value || '').toLowerCase();
  let key = 'default';

  if (value.includes('manila') || value.includes('intramuros') || value.includes('pasay')) key = 'manila';
  if (value.includes('cebu')) key = 'cebu';
  if (value.includes('davao')) key = 'davao';

  suggestList.innerHTML = '';

  const list = suggestionSets[key] || suggestionSets.default;
  list.forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'suggest-chip';
    chip.textContent = item;

    chip.addEventListener('click', () => {
      destinationInput.value = item;
      debouncedSearchPlaces(item);
    });

    suggestList.appendChild(chip);
  });

  suggestionsHint.textContent =
    key === 'default'
      ? 'Suggestions update based on your destination.'
      : `Popular nearby stops for ${key.toUpperCase()}.`;
}

function updateUserLocation(lat, lng) {
  if (!map) return;

  // Store coordinates for nearby user detection
  lastUserCoords = { lat, lng };

  if (!userMarker) {
    userMarker = L.marker([lat, lng]).addTo(map);
    userMarker.bindPopup('You are here');
  } else {
    userMarker.setLatLng([lat, lng]);
  }

  const center = map.getCenter();
  const current = { lat, lng };
  const centerPoint = { lat: center.lat, lng: center.lng };

  if (metersBetween(current, centerPoint) > 45) {
    map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
  }

  if (sharingOn) {
    const live = getLiveData();
    live.me = {
      lat,
      lng,
      updatedAt: Date.now(),
      label: localStorage.getItem(NAME_KEY) || 'You',
      mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
    };
    setLiveData(live);
    
    // Share to Firebase in real-time
    if (window.currentUser && lastReadableLocation) {
      window.shareLocationToFirebase(window.currentUser.uid, lat, lng, lastReadableLocation);
    }
    
    renderContacts();
  }
}

async function requestLocation() {
  if (!navigator.geolocation) {
    locationInput.value = 'Location is not supported on this device';
    return;
  }

  initMap();

  if (watchId) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const raw = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      const accuracy = Math.round(pos.coords.accuracy || 0);
      const smoothed = smoothCoords(lastUserCoords, raw, 0.4);
      const movedMeters = metersBetween(lastUserCoords || smoothed, smoothed);
      lastUserCoords = smoothed;

      updateUserLocation(smoothed.lat, smoothed.lng);

      const now = Date.now();
      const shouldReverseLookup = !lastReverseLookupAt || now - lastReverseLookupAt > 12000;

      if (shouldReverseLookup) {
        lastReverseLookupAt = now;
        const place = await reverseGeocode(smoothed.lat, smoothed.lng);
        lastReadableLocation = place.fullAddress || place.label;
        locationInput.value = `${place.label} • ±${accuracy}m`;
      } else if (lastReadableLocation) {
        locationInput.value = `${lastReadableLocation.split(',')[0]} • ±${accuracy}m`;
      }

      mapDescription.textContent =
        accuracy <= 20
          ? 'Live location active • Strong GPS accuracy'
          : accuracy <= 50
          ? 'Live location active • Moderate GPS accuracy'
          : 'Live location active • Weak GPS accuracy';

      const shouldReroute =
        selectedDestination &&
        movedMeters > 12 &&
        now - lastRouteRefreshAt > 5000;

      if (shouldReroute) {
        lastRouteRefreshAt = now;
        drawRoute(selectedDestination.lat, selectedDestination.lng);
      }
    },
    (err) => {
      locationInput.value = 'Location permission denied';
      mapDescription.textContent =
        err.code === 1
          ? 'Location permission denied. Please allow access.'
          : 'Unable to get your current location.';
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000
    }
  );
}

function saveContact() {
  const name = contactNameInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  const email = contactEmailInput.value.trim();

  if (!name) {
    alert('Please enter the contact name.');
    return;
  }

  if (!phone && !email) {
    alert('Please add at least a phone number or an email.');
    return;
  }

  // Validate phone if provided
  if (phone && !window.validatePhoneNumber(phone)) {
    alert('Invalid phone format. Use 09XXXXXXXXX or +639XXXXXXXXX');
    return;
  }

  const contact = {
    id: uid(),
    name,
    phone: phone ? window.formatPhoneNumber(phone) : '',
    email,
    createdAt: Date.now()
  };

  const contacts = getContacts();
  contacts.push(contact);

  setContacts(contacts);

  // Save to Firebase if user is logged in
  if (window.currentUser && window.navifyDb) {
    window.navifyDb.ref(`users/${window.currentUser.uid}/contacts/${contact.id}`).set(contact);
  }

  contactNameInput.value = '';
  contactPhoneInput.value = '';
  contactEmailInput.value = '';

  renderContacts();
  closeModal(shareModal);
  setStatus(`${name} added to your Trusted Circle.`);
}

function renderContacts() {
  if (!contactList) return;

  const contacts = getContacts();
  const live = getLiveData();
  const me = live.me;

  contactList.innerHTML = '';

  if (!contacts.length) {
    const empty = document.createElement('div');
    empty.className = 'contact-item';
    empty.innerHTML = `
      <div class="contact-name">No trusted contacts yet</div>
      <div class="contact-meta">Tap the + button to add family or friends.</div>
    `;
    contactList.appendChild(empty);
    return;
  }

  contacts.forEach((contact) => {
    const card = document.createElement('div');
    card.className = 'contact-item';

    const contactLive = live[contact.id];
    let distanceText = 'No shared location yet';

    if (me && contactLive) {
      const km = haversineKm(
        { lat: me.lat, lng: me.lng },
        { lat: contactLive.lat, lng: contactLive.lng }
      );
      distanceText = `${km.toFixed(2)} km away`;
    }

    card.innerHTML = `
      <div class="contact-top">
        <div>
          <div class="contact-name">${contact.name}</div>
          <div class="contact-meta">${contact.phone || 'No phone'} ${contact.email ? `• ${contact.email}` : ''}</div>
          <div class="contact-distance">${distanceText}</div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openContactModal(contact.id));
    contactList.appendChild(card);
  });

  liveStatus.textContent = sharingOn
    ? 'Live updates on. Your location is ready to share.'
    : 'Live updates are off.';
}

function openContactModal(contactId) {
  const contacts = getContacts();
  const live = getLiveData();
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return;

  currentContactId = contactId;
  const contactLive = live[contact.id];

  contactModalTitle.textContent = contact.name;
  contactModalSubtitle.textContent = 'Choose how you want to contact or locate this person.';

  contactDetailBox.innerHTML = `
    <div><strong>Phone:</strong> ${contact.phone || 'Not set'}</div>
    <div><strong>Email:</strong> ${contact.email || 'Not set'}</div>
    <div><strong>Location:</strong> ${
      contactLive?.mapUrl ? `<a href="${contactLive.mapUrl}" target="_blank" style="color:#7bf1ff;">Open shared location</a>` : 'No shared location available'
    }</div>
  `;

  openModal(contactModal);
}

function getCurrentContact() {
  const contacts = getContacts();
  return contacts.find((c) => c.id === currentContactId);
}

function deleteCurrentContact() {
  const contact = getCurrentContact();
  if (!contact) return;

  const confirmed = confirm(`Delete ${contact.name} from Trusted Circle?`);
  if (!confirmed) return;

  const next = getContacts().filter((c) => c.id !== contact.id);
  setContacts(next);

  // Remove from Firebase if user is logged in
  if (window.currentUser && window.navifyDb) {
    window.navifyDb.ref(`users/${window.currentUser.uid}/contacts/${contact.id}`).remove();
  }

  const live = getLiveData();
  delete live[contact.id];
  setLiveData(live);

  renderContacts();
  closeModal(contactModal);
}

function locateCurrentContact() {
  const contact = getCurrentContact();
  if (!contact) return;

  const live = getLiveData();
  const contactLive = live[contact.id];

  if (!contactLive?.lat || !contactLive?.lng) {
    alert('This contact has not shared a location yet.');
    return;
  }

  initMap();
  map.setView([contactLive.lat, contactLive.lng], 16, { animate: true });

  if (destinationInput) {
    destinationInput.value = `${contact.name} shared location`;
  }

  selectedDestination = {
    lat: contactLive.lat,
    lng: contactLive.lng,
    label: `${contact.name} location`,
    address: `${contact.name} shared location`
  };

  localStorage.setItem(DESTINATION_KEY, JSON.stringify(selectedDestination));
  setDestinationMarker(contactLive.lat, contactLive.lng, `${contact.name} location`);

  if (userMarker) {
    drawRoute(contactLive.lat, contactLive.lng);
  }

  closeModal(contactModal);
}

function shareMyLocationWithCurrentContact() {
  const contact = getCurrentContact();
  if (!contact) return;

  const live = getLiveData();
  const me = live.me;

  if (!me?.mapUrl) {
    alert('Turn on your location first so Navify can share your map link.');
    return;
  }

  const message = `Hi ${contact.name}, here is my live location from Navify: ${me.mapUrl}`;

  if (contact.phone) {
    window.location.href = `sms:${sanitizePhone(contact.phone)}?body=${encodeURIComponent(message)}`;
    return;
  }

  if (contact.email) {
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('My Navify Location')}&body=${encodeURIComponent(message)}`;
    return;
  }

  alert('This contact has no phone number or email.');
}

function syncDemoContactLocations() {
  const contacts = getContacts();
  const live = getLiveData();
  const me = live.me;

  if (!me) return;

  contacts.forEach((contact, index) => {
    if (!live[contact.id]) {
      const offset = 0.002 + index * 0.0013;
      live[contact.id] = {
        lat: me.lat + offset,
        lng: me.lng - offset,
        updatedAt: Date.now(),
        mapUrl: `https://www.google.com/maps?q=${me.lat + offset},${me.lng - offset}`
      };
    }
  });

  setLiveData(live);
}

// Real-time friend location tracking
function initFriendTracking() {
  if (!window.currentUser || !window.navifyDb) return;
  
  const contacts = getContacts();
  contacts.forEach(contact => {
    if (contact.id && !friendListeners[contact.id]) {
      friendListeners[contact.id] = window.listenToFriendLocation(contact.id, (location) => {
        if (location && map) {
          updateFriendMarkerOnMap(contact.id, contact.name, location.lat, location.lng, location.address);
        }
      });
    }
  });
}

function stopFriendTracking() {
  Object.keys(friendListeners).forEach(contactId => {
    if (friendListeners[contactId]) {
      friendListeners[contactId]();
      delete friendListeners[contactId];
    }
  });
  
  // Remove all friend markers from map
  Object.keys(friendMarkers).forEach(contactId => {
    if (friendMarkers[contactId]) {
      map.removeLayer(friendMarkers[contactId]);
      delete friendMarkers[contactId];
    }
  });
}

function updateFriendMarkerOnMap(contactId, contactName, lat, lng, address) {
  if (!map || !lat || !lng) return;
  
  if (friendMarkers[contactId]) {
    friendMarkers[contactId].setLatLng([lat, lng]);
    friendMarkers[contactId].setPopupContent(`
      <div style="text-align: center; font-size: 12px; color: #fff;">
        <strong>${contactName}</strong><br>
        ${address || 'Current location'}<br>
        <button style="margin-top: 4px; padding: 4px 12px; background: #7bf1ff; border: none; border-radius: 4px; cursor: pointer;" onclick="centerMapOnCoords(${lat}, ${lng})">View</button>
      </div>
    `);
  } else {
    const marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map);
    
    marker.bindPopup(`
      <div style="text-align: center; font-size: 12px; color: #333;">
        <strong>${contactName}</strong><br>
        ${address || 'Current location'}<br>
        <button style="margin-top: 4px; padding: 4px 12px; background: #7bf1ff; border: none; border-radius: 4px; cursor: pointer;" onclick="centerMapOnCoords(${lat}, ${lng})">View</button>
      </div>
    `);
    
    friendMarkers[contactId] = marker;
  }
}

function centerMapOnCoords(lat, lng) {
  if (map) {
    map.setView([lat, lng], 16, { animate: true });
  }
}

// Detect nearby users
async function detectNearbyUsers() {
  if (!window.currentUser || !lastUserCoords || !window.getNearbyUsers) return;
  
  try {
    nearbyUsers = await window.getNearbyUsers(lastUserCoords.lat, lastUserCoords.lng, 5);
    renderNearbyUsersList();
  } catch (err) {
    console.error('Error detecting nearby users:', err);
  }
}

function renderNearbyUsersList() {
  const container = document.getElementById('nearbyUsersList');
  if (!container) return;
  
  if (nearbyUsers.length === 0) {
    container.innerHTML = '<div class="panel-sub" style="padding: 16px; text-align: center;">No nearby users found. Check back later!</div>';
    return;
  }
  
  container.innerHTML = nearbyUsers.map(user => `
    <div class="contact-item" style="padding: 12px; margin: 8px 0; background: rgba(123, 241, 255, 0.1); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div class="contact-name">${user.name}</div>
          <div class="contact-meta">${user.distance} km away</div>
          <div class="contact-meta">${user.address || 'Current location'}</div>
        </div>
        <button class="primary-btn" onclick="addNearbyUserToCircle('${user.uid}', '${user.name}', '${user.phone}')" style="padding: 6px 12px; font-size: 12px;">+ Add</button>
      </div>
    </div>
  `).join('');
}

function addNearbyUserToCircle(uid, name, phone) {
  const contacts = getContacts();
  const exists = contacts.some(c => c.phone === phone);
  
  if (exists) {
    alert(`${name} is already in your circle!`);
    return;
  }
  
  const contact = {
    id: uid,
    name: name,
    phone: phone,
    email: '',
    createdAt: Date.now()
  };
  
  contacts.push(contact);
  setContacts(contacts);
  
  // Save to Firebase
  if (window.currentUser && window.navifyDb) {
    window.navifyDb.ref(`users/${window.currentUser.uid}/contacts/${contact.id}`).set(contact);
  }
  
  initFriendTracking();
  renderContacts();
  setStatus(`${name} added to your trusted circle!`);
  closeModal(document.getElementById('nearbyUsersModal'));
}

// Voice calling
function initiateVoiceCall(contact) {
  if (!contact.phone) {
    alert('Contact has no phone number');
    return;
  }
  
  voiceCallActive = contact.id;
  
  // Option 1: Use native phone call
  const confirmed = confirm(`Call ${contact.name} at ${contact.phone}?`);
  if (confirmed) {
    window.location.href = `tel:${sanitizePhone(contact.phone)}`;
  }
}

function renderFavorites() {
  transportList.innerHTML = '';
  favoritePlaces.forEach((place) => {
    const item = document.createElement('div');
    item.className = 'transport-item';
    item.innerHTML = `
      <div class="trip-place-name">${place.name}</div>
      <div class="trip-place-meta">${place.label}</div>
    `;

    item.addEventListener('click', () => {
      selectedDestination = {
        lat: place.lat,
        lng: place.lng,
        label: place.name,
        address: place.label
      };

      localStorage.setItem(DESTINATION_KEY, JSON.stringify(selectedDestination));
      destinationInput.value = `${place.name} - ${place.label}`;
      setDestinationMarker(place.lat, place.lng, place.name);
      map.setView([place.lat, place.lng], 15, { animate: true });

      if (userMarker) drawRoute(place.lat, place.lng);
      updateSuggestions();
      closeModal(transportModal);
    });

    transportList.appendChild(item);
  });
}

function renderTripPlaces(category) {
  tripPlaces.innerHTML = '';
  const places = tripIdeaSets[category] || [];

  if (!places.length) {
    tripPlaces.innerHTML = `<div class="panel-sub">Choose a category to see places.</div>`;
    return;
  }

  places.forEach((place) => {
    const card = document.createElement('div');
    card.className = 'trip-place-card';
    card.innerHTML = `
      <img class="trip-place-image" src="${place.image}" alt="${place.name}" />
      <div>
        <div class="trip-place-name">${place.name}</div>
        <div class="trip-place-meta">${place.location}</div>
        <div class="trip-place-meta">Hours: ${place.hours}</div>
        <div class="trip-place-meta">Rating: ${place.rating}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      selectedDestination = {
        lat: place.lat,
        lng: place.lng,
        label: place.name,
        address: place.location
      };

      localStorage.setItem(DESTINATION_KEY, JSON.stringify(selectedDestination));
      destinationInput.value = `${place.name} - ${place.location}`;
      setDestinationMarker(place.lat, place.lng, place.name);
      map.setView([place.lat, place.lng], 15, { animate: true });

      if (userMarker) drawRoute(place.lat, place.lng);
      updateSuggestions();
      closeModal(categoryModal);
    });

    tripPlaces.appendChild(card);
  });
}

function renderTripCategories() {
  categoryGrid.innerHTML = '';

  Object.keys(tripIdeaSets).forEach((key) => {
    const chip = document.createElement('button');
    chip.className = 'category-chip';
    chip.type = 'button';
    chip.textContent = key;

    chip.addEventListener('click', () => renderTripPlaces(key));
    categoryGrid.appendChild(chip);
  });

  const first = Object.keys(tripIdeaSets)[0];
  if (first) renderTripPlaces(first);
}

function restoreDestination() {
  const stored = localStorage.getItem(DESTINATION_KEY);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    selectedDestination = parsed;

    if (destinationInput) {
      destinationInput.value = parsed.address || parsed.label || '';
    }

    if (map) {
      setDestinationMarker(parsed.lat, parsed.lng, parsed.label);
    }
  } catch {
    // ignore corrupted destination
  }
}

avatarBtn?.addEventListener('click', () => openModal(avatarModal));
openShareModal?.addEventListener('click', () => openModal(shareModal));
menuBtn?.addEventListener('click', () => openModal(prefsModal));
transportCard?.addEventListener('click', () => openModal(transportModal));
categoryCard?.addEventListener('click', () => openModal(categoryModal));
addContactBtn?.addEventListener('click', saveContact);

shareToggle?.addEventListener('click', () => {
  sharingOn = !sharingOn;
  localStorage.setItem(SHARE_STATE_KEY, String(sharingOn));
  shareToggle.textContent = sharingOn ? 'Share: On' : 'Share: Off';

  if (sharingOn) {
    requestLocation();
    // Share location to Firebase in real-time
    if (window.currentUser && lastUserCoords && lastReadableLocation) {
      window.shareLocationToFirebase(window.currentUser.uid, lastUserCoords.lat, lastUserCoords.lng, lastReadableLocation);
    }
    initFriendTracking();
    setStatus('Live sharing enabled. Friends can see your location.');
  } else {
    // Stop sharing location
    if (window.currentUser) {
      window.stopSharingLocation(window.currentUser.uid);
    }
    stopFriendTracking();
    setStatus('Live sharing paused.');
  }

  renderContacts();
});

detectLocationBtn?.addEventListener('click', requestLocation);

walkRouteBtn?.addEventListener('click', () => {
  if (!selectedDestination) {
    alert('Choose a destination first by searching or tapping the map.');
    return;
  }
  window.location.href = 'guide.html';
});

// Nearby users button
document.getElementById('nearbyBtn')?.addEventListener('click', () => {
  detectNearbyUsers();
  openModal(document.getElementById('nearbyUsersModal'));
});

// Refresh nearby users
document.getElementById('refreshNearbyBtn')?.addEventListener('click', () => {
  detectNearbyUsers();
  setStatus('Refreshing nearby users...');
});

// Voice call button
document.getElementById('voiceCallBtn')?.addEventListener('click', () => {
  if (!currentContactId) return;
  const contact = getContacts().find(c => c.id === currentContactId);
  if (contact) {
    initiateVoiceCall(contact);
  }
});

destinationInput?.addEventListener('input', (e) => {
  debouncedSearchPlaces(e.target.value);
  updateSuggestions();
});

document.addEventListener('click', (e) => {
  if (!destinationSuggestions || !destinationInput) return;
  if (!destinationSuggestions.contains(e.target) && e.target !== destinationInput) {
    destinationSuggestions.classList.remove('show');
  }
});

savePrefsBtn?.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Traveler';
  localStorage.setItem(NAME_KEY, name);
  userName.textContent = name;
  closeModal(prefsModal);
});

avatarUpload?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === 'string') {
      avatarImg.src = result;
      localStorage.setItem(AVATAR_KEY, result);
      closeModal(avatarModal);
    }
  };
  reader.readAsDataURL(file);
});

callContactBtn?.addEventListener('click', () => {
  const contact = getCurrentContact();
  if (!contact?.phone) {
    alert('This contact has no phone number.');
    return;
  }
  window.location.href = `tel:${sanitizePhone(contact.phone)}`;
});

textContactBtn?.addEventListener('click', () => {
  const contact = getCurrentContact();
  if (!contact?.phone) {
    alert('This contact has no phone number.');
    return;
  }
  const body = `Hi ${contact.name}, this is from Navify.`;
  window.location.href = `sms:${sanitizePhone(contact.phone)}?body=${encodeURIComponent(body)}`;
});

emailContactBtn?.addEventListener('click', () => {
  const contact = getCurrentContact();
  if (!contact?.email) {
    alert('This contact has no email.');
    return;
  }
  window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('Navify Contact')}&body=${encodeURIComponent(`Hi ${contact.name}, this is from Navify.`)}`;
});

locateContactBtn?.addEventListener('click', locateCurrentContact);
shareMyLocationBtn?.addEventListener('click', shareMyLocationWithCurrentContact);
deleteContactBtn?.addEventListener('click', deleteCurrentContact);

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadName();
  loadAvatar();
  renderAvatarOptions();
  renderFavorites();
  renderSavedPlaces();
  renderTripCategories();
  restoreDestination();
  updateSuggestions();
  renderContacts();
  updateTransportModeUI();

  if (sharingOn) {
    shareToggle.textContent = 'Share: On';
    requestLocation();
    // Initialize friend tracking if already sharing
    setTimeout(() => initFriendTracking(), 1000);
  }

  syncDemoContactLocations();
  renderContacts();
});

function updateTransportModeUI() {
  const labels = { walk: 'Walk', car: 'Car', transit: 'Transit' };
  const currentLabel = document.getElementById('currentTransportLabel');
  if (currentLabel) {
    currentLabel.textContent = labels[window.currentTransportMode] || 'Walk';
  }
  
  // Highlight active button
  document.getElementById('transportWalkBtn')?.classList.toggle('active', window.currentTransportMode === 'walk');
  document.getElementById('transportCarBtn')?.classList.toggle('active', window.currentTransportMode === 'car');
  document.getElementById('transportTransitBtn')?.classList.toggle('active', window.currentTransportMode === 'transit');
}

function setDestinationAndRoute(lat, lng, name) {
  selectedDestination = { lat, lng, name };
  destinationInput.value = name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  drawRoute(lat, lng);
  // Close modal if open
  const modal = document.getElementById('transportModal');
  if (modal) modal.setAttribute('hidden', 'true');
}
