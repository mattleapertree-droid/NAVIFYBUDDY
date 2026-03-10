let signupInProgress = false;

function bindSignUp() {
  const signUpBtn = document.getElementById('signUpBtn');
  const signUpModal = document.getElementById('signUpModal');
  const createAccountBtn = document.getElementById('createAccountBtn');
  const smOtpModal = document.getElementById('smOtpModal');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const smsOtpCode = document.getElementById('smsOtpCode');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const authScreen = document.getElementById('authScreen');
  
  // Get form inputs with specific IDs
  const nameInput = signUpModal?.querySelector('#signUpName');
  const emailInput = signUpModal?.querySelector('#signUpEmail');
  const phoneInput = signUpModal?.querySelector('#signUpPhone');
  const passwordInput = signUpModal?.querySelector('#signUpPassword');
  const confirmInput = signUpModal?.querySelector('#signUpConfirm');
  const termsInput = signUpModal?.querySelector('#signUpTerms');
  const signUpError = signUpModal?.querySelector('#signUpError');
  const smsOtpError = smOtpModal?.querySelector('#smsOtpError');

  function showSignUpError(message) {
    if (signUpError) {
      signUpError.textContent = message;
      signUpError.style.display = 'block';
    }
  }

  function hideSignUpError() {
    if (signUpError) {
      signUpError.style.display = 'none';
    }
  }

  function showOtpError(message) {
    if (smsOtpError) {
      smsOtpError.textContent = message;
      smsOtpError.style.display = 'block';
    }
  }

  function hideOtpError() {
    if (smsOtpError) {
      smsOtpError.style.display = 'none';
    }
  }

  signUpBtn?.addEventListener('click', () => {
    hideSignUpError();
    openModal(signUpModal);
  });
  
  createAccountBtn?.addEventListener('click', async () => {
    hideSignUpError();
    
    if (!emailInput || !phoneInput || !passwordInput || !nameInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput?.value.trim() || '';
    const termsAccepted = termsInput?.checked || false;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      showSignUpError('Please fill in all fields');
      return;
    }

    if (!name.includes(' ') || name.length < 5) {
      showSignUpError('Please enter your full name (first and last name)');
      return;
    }
    
    if (password.length < 8) {
      showSignUpError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      showSignUpError('Passwords do not match');
      return;
    }
    
    if (!window.validatePhoneNumber(phone)) {
      showSignUpError('Invalid phone number. Use format: 09XXXXXXXXX or +639XXXXXXXXX');
      return;
    }
    
    if (!termsAccepted) {
      showSignUpError('You must agree to the Terms & Privacy Policy');
      return;
    }

    try {
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = 'Sending verification code...';
      
      // Step 1: Send OTP to phone
      console.log('Sending OTP to phone:', phone);
      const otpResult = await window.sendSmsOtp(phone);
      
      if (otpResult.success) {
        // Store signup data temporarily
        window.setSignupData({
          email: email,
          name: name,
          password: password,
          phone: phone
        });
        
        signupInProgress = true;
        
        // Close signup modal and open OTP verification modal
        closeModal(signUpModal);
        openModal(smOtpModal);
        
        // Clear any previous OTP input
        if (smsOtpCode) smsOtpCode.value = '';
        if (smsOtpCode) smsOtpCode.focus();
        
        // Show development test code if in dev mode (for testing)
        if (otpResult.devTestCode) {
          console.log('TEST CODE FOR DEVELOPMENT:', otpResult.devTestCode);
        }
      }
    } catch (err) {
      console.error('OTP sending failed:', err);
      showSignUpError(err.message || 'Failed to send verification code. Please check your phone number and try again.');
    } finally {
      createAccountBtn.disabled = false;
      createAccountBtn.textContent = 'Create account & Verify Phone';
    }
  });

  // OTP Verification
  verifyOtpBtn?.addEventListener('click', async () => {
    hideOtpError();

    if (!smsOtpCode) return;
    
    const enteredCode = smsOtpCode.value.trim();
    
    if (!enteredCode || enteredCode.length !== 6) {
      showOtpError('Please enter the 6-digit code');
      return;
    }

    try {
      // Check if Firebase is initialized
      if (!window.navifyAuth) {
        throw new Error('Firebase authentication not initialized. Please refresh the page.');
      }

      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'Verifying...';

      // Verify OTP
      const verifyResult = window.verifySmsOtp(enteredCode);
      
      if (verifyResult.success) {
        // Get the signup data
        const signupData = window.getSignupData();
        
        if (!signupData || !signupData.email || !signupData.password) {
          throw new Error('Signup data corrupted. Please try again.');
        }

        // Now create the Firebase account
        let userCred;
        try {
          userCred = await window.navifyAuth.createUserWithEmailAndPassword(
            signupData.email,
            signupData.password
          );
        } catch (firebaseErr) {
          console.error('Firebase signup error:', firebaseErr);
          if (firebaseErr.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered. Please sign in instead.');
          } else if (firebaseErr.code === 'auth/weak-password') {
            throw new Error('Password is too weak. Please use a stronger password.');
          } else if (firebaseErr.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
          }
          throw firebaseErr;
        }

        const user = userCred.user;
        
        // Update display name
        try {
          await user.updateProfile({ displayName: signupData.name });
        } catch (profileErr) {
          console.warn('Failed to update profile:', profileErr);
        }
        
        // Store phone number in Firebase with verified flag
        try {
          await window.verifyUserPhone(user.uid, signupData.phone);
        } catch (phoneErr) {
          console.warn('Failed to store phone verification:', phoneErr);
        }
        
        // Send email verification
        try {
          await user.sendEmailVerification();
        } catch (e) {
          console.warn('Email verification not sent:', e);
        }
        
        // Store in localStorage
        localStorage.setItem('navify-user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: signupData.name,
          phone: signupData.phone,
          loggedInAt: Date.now(),
          phoneVerified: true
        }));
        
        // Clear OTP data
        window.clearOtpData();
        signupInProgress = false;
        
        closeModal(smOtpModal);
        alert('✓ Account created successfully!\n\nYour phone number has been verified. You can now sign in to Navify and start connecting with travelers!');
        window.location.href = 'index.html';
      }
    } catch (err) {
      console.error('Signup completion failed:', err);
      
      let errorMsg = err.message || 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      
      showOtpError(errorMsg);
    } finally {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'Verify & Complete Signup';
    }
  });

  // Resend OTP
  resendOtpBtn?.addEventListener('click', async () => {
    try {
      const signupData = window.getSignupData();
      if (!signupData.phone) {
        showOtpError('Phone number not found. Please start signup again.');
        return;
      }
      
      resendOtpBtn.style.opacity = '0.5';
      resendOtpBtn.style.pointerEvents = 'none';
      resendOtpBtn.textContent = 'Sending...';
      
      await window.sendSmsOtp(signupData.phone);
      
      hideOtpError();
      alert('New verification code sent to your phone!');
      
      if (smsOtpCode) smsOtpCode.value = '';
      if (smsOtpCode) smsOtpCode.focus();
      
      // Reset button after 30 seconds
      setTimeout(() => {
        resendOtpBtn.style.opacity = '1';
        resendOtpBtn.style.pointerEvents = 'auto';
        resendOtpBtn.textContent = 'Resend';
      }, 30000);
    } catch (err) {
      console.error('Resend OTP failed:', err);
      showOtpError(err.message || 'Failed to resend code. Please try again.');
      resendOtpBtn.style.opacity = '1';
      resendOtpBtn.style.pointerEvents = 'auto';
      resendOtpBtn.textContent = 'Resend';
    }
  });
}

function parseFirebaseError(err) {
  if (err.code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in instead.';
  } else if (err.code === 'auth/weak-password') {
    return 'Password is too weak. Please use a stronger password.';
  } else if (err.code === 'auth/invalid-email') {
    return 'Invalid email address.';
  }
  return err.message || 'An error occurred';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindSignUp);
} else {
  bindSignUp();
}

function parseFirebaseError(error) {
  const code = error.code || '';
  if (code.includes('email-already-in-use')) return 'Email already registered';
  if (code.includes('weak-password')) return 'Password is too weak';
  if (code.includes('invalid-email')) return 'Invalid email address';
  return error.message || 'Sign-up failed. Please try again.';
}

document.addEventListener('DOMContentLoaded', bindSignUp);
