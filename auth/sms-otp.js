// SMS OTP Verification System
// 
// DEVELOPMENT MODE: Uses mock SMS with test code displayed on page
// PRODUCTION MODE: Replace with Twilio, Firebase Phone Auth, or similar
//
// To use real SMS in production:
// 1. Sign up for Twilio (twilio.com) or Firebase Phone Authentication
// 2. Get API credentials
// 3. Replace sendSmsOtp function with real SMS service call
// 4. Update verifyUrOtp to work with real SMS provider

let pendingOtpData = {
  code: null,
  phone: null,
  userId: null,
  email: null,
  name: null,
  password: null,
  createdAt: null,
  expiresAt: null,
  attempts: 0
};

// Generate a random 6-digit OTP code
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS OTP to user's phone
// DEVELOPMENT: Displays test code on page
// PRODUCTION: Use Twilio, Firebase Phone Auth, etc.
window.sendSmsOtp = async (phone) => {
  try {
    // Validate phone format
    if (!window.validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format. Use 09XXXXXXXXX or +639XXXXXXXXX');
    }

    const code = generateOtpCode();
    const now = Date.now();
    
    // Store OTP data in memory for 10 minutes
    pendingOtpData = {
      code: code,
      phone: phone,
      createdAt: now,
      expiresAt: now + (10 * 60 * 1000), // 10 minutes
      attempts: 0
    };

    console.log(`[SMS OTP Generated] Phone: ${phone}, Code: ${code}`);
    
    // DEVELOPMENT MODE: Store in localStorage for testing
    localStorage.setItem('_dev_otp', code);
    
    // DEVELOPMENT MODE: Display on page
    const devCodeBox = document.getElementById('devTestCodeBox');
    const devCodeDisplay = document.getElementById('devTestCode');
    if (devCodeBox && devCodeDisplay) {
      devCodeBox.style.display = 'block';
      devCodeDisplay.textContent = code;
    }
    
    // PRODUCTION: Uncomment below and add your SMS service
    /*
    // EXAMPLE: Using Twilio (install twilio-node)
    const twilio = require('twilio');
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your Navify verification code is: ${code}`,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    // EXAMPLE: Using Firebase Phone Authentication
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    const confirmationResult = await firebase.auth().signInWithPhoneNumber(phone, appVerifier);
    // User receives SMS automatically from Firebase
    */
    
    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      devTestCode: code
    };
  } catch (err) {
    console.error('Failed to send OTP:', err);
    throw err;
  }
};

// Verify OTP code
window.verifySmsOtp = (enteredCode) => {
  try {
    const now = Date.now();
    
    // Check if OTP exists
    if (!pendingOtpData.code) {
      throw new Error('No verification in progress. Please request a new OTP.');
    }
    
    // Check if OTP expired
    if (now > pendingOtpData.expiresAt) {
      pendingOtpData = { code: null, phone: null };
      throw new Error('Verification code expired. Please request a new one.');
    }
    
    // Check attempts
    if (pendingOtpData.attempts >= 5) {
      pendingOtpData = { code: null, phone: null };
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }
    
    // Verify code
    if (enteredCode.trim() !== pendingOtpData.code) {
      pendingOtpData.attempts += 1;
      const remaining = 5 - pendingOtpData.attempts;
      throw new Error(`Incorrect code. ${remaining} attempts remaining.`);
    }
    
    // Code is correct - clear development OTP from localStorage
    localStorage.removeItem('_dev_otp');
    
    // Hide test code display
    const devCodeBox = document.getElementById('devTestCodeBox');
    if (devCodeBox) {
      devCodeBox.style.display = 'none';
    }
    
    return {
      success: true,
      message: 'Phone verified successfully!',
      phone: pendingOtpData.phone
    };
  } catch (err) {
    console.error('OTP verification failed:', err);
    throw err;
  }
};

// Store user data for signup completion
window.setSignupData = (data) => {
  pendingOtpData = {
    ...pendingOtpData,
    userId: data.userId,
    email: data.email,
    name: data.name,
    password: data.password
  };
};

// Get user data after OTP verification
window.getSignupData = () => {
  return {
    phone: pendingOtpData.phone,
    email: pendingOtpData.email,
    name: pendingOtpData.name,
    password: pendingOtpData.password
  };
};

// Clear OTP data
window.clearOtpData = () => {
  pendingOtpData = {
    code: null,
    phone: null,
    userId: null,
    email: null,
    name: null,
    password: null,
    createdAt: null,
    expiresAt: null,
    attempts: 0
  };
  localStorage.removeItem('_dev_otp');
  
  // Hide test code display
  const devCodeBox = document.getElementById('devTestCodeBox');
  if (devCodeBox) {
    devCodeBox.style.display = 'none';
  }
};
