let signupInProgress = false;

function bindSignUp() {
  const signUpBtn = document.getElementById('signUpBtn');
  const signUpModal = document.getElementById('signUpModal');
  const createAccountBtn = document.getElementById('createAccountBtn');
  
  // Get form inputs with specific IDs
  const nameInput = signUpModal?.querySelector('#signUpName');
  const emailInput = signUpModal?.querySelector('#signUpEmail');
  const passwordInput = signUpModal?.querySelector('#signUpPassword');
  const confirmInput = signUpModal?.querySelector('#signUpConfirm');
  const termsInput = signUpModal?.querySelector('#signUpTerms');
  const signUpError = signUpModal?.querySelector('#signUpError');

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

  signUpBtn?.addEventListener('click', () => {
    hideSignUpError();
    openModal(signUpModal);
  });
  
  createAccountBtn?.addEventListener('click', async () => {
    hideSignUpError();
    
    if (!emailInput || !passwordInput || !nameInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput?.value.trim() || '';
    const termsAccepted = termsInput?.checked || false;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      showSignUpError('Please fill in all fields');
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
    
    if (!termsAccepted) {
      showSignUpError('You must agree to the Terms & Privacy Policy');
      return;
    }

    try {
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = 'Creating account...';
      
      // Create account directly with Firebase
      const user = await navifyEmailSignUp(email, password, name);
      
      console.log('✓ Account created successfully:', user.uid);
      
      // Store user in localStorage
      storeNavifyUser(user);
      
      // Close modal and redirect to home
      closeModal(signUpModal);
      alert('Welcome! Your account has been created successfully. 🎉');
      window.location.href = 'pages/home.html';
      
    } catch (err) {
      console.error('Signup failed:', err);
      showSignUpError(err.message || 'Failed to create account. Please try again.');
    } finally {
      createAccountBtn.disabled = false;
      createAccountBtn.textContent = 'Quick Sign Up';
    }
  });
      verifyOtpBtn.textContent = 'Verifying...';

      // Verify OTP
      const verifyResult = window.verifySmsOtp(enteredCode);
      
      if (verifyResult.success) {
        // Get the signup data
        const signupData = window.getSignupData();
        
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
