// SMS OTP Verification System
// Mock implementation for development - in production use Twilio or Firebase Phone Auth

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

// Send SMS OTP to user's phone (mock implementation)
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

    // In production, send via Twilio, Firebase, or other SMS service
    console.log(`[MOCK SMS] OTP sent to ${phone}: ${code}`);
    console.log('[DEV] Check browser console for test code above ↑');
    
    // For demo/testing: log the code to console
    // In production: actual SMS will be sent to user's phone
    // For now, also store in localStorage for testing (remove in production)
    localStorage.setItem('_dev_otp', code);
    
    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      devTestCode: code // Remove in production
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
};
