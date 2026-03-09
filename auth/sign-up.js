function bindSignUp() {
  const signUpBtn = document.getElementById('signUpBtn');
  const signUpModal = document.getElementById('signUpModal');
  const createAccountBtn = document.getElementById('createAccountBtn');
  const authScreen = document.getElementById('authScreen');
  
  // Get form inputs with specific IDs
  const nameInput = signUpModal?.querySelector('#signUpName');
  const emailInput = signUpModal?.querySelector('#signUpEmail');
  const phoneInput = signUpModal?.querySelector('#signUpPhone');
  const passwordInput = signUpModal?.querySelector('#signUpPassword');
  const confirmInput = signUpModal?.querySelector('#signUpConfirm');
  const termsInput = signUpModal?.querySelector('#signUpTerms');
  const errorDiv = signUpModal?.querySelector('#signUpError');

  signUpBtn?.addEventListener('click', () => openModal(signUpModal));
  
  createAccountBtn?.addEventListener('click', async () => {
    if (!emailInput || !phoneInput || !passwordInput || !nameInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput?.value.trim() || '';
    const termsAccepted = termsInput?.checked || false;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      showError('Please fill in all fields', errorDiv);
      return;
    }
    
    if (password.length < 8) {
      showError('Password must be at least 8 characters', errorDiv);
      return;
    }
    
    if (password !== confirmPassword) {
      showError('Passwords do not match', errorDiv);
      return;
    }
    
    if (!window.validatePhoneNumber(phone)) {
      showError('Invalid phone number. Use format: 09XXXXXXXXX or +639XXXXXXXXX', errorDiv);
      return;
    }
    
    if (!termsAccepted) {
      showError('You must agree to the Terms & Privacy', errorDiv);
      return;
    }
    
    try {
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = 'Creating account...';
      
      // Create Firebase user
      const userCred = await window.navifyAuth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;
      
      // Set display name
      await user.updateProfile({ displayName: name });
      
      // Store verified phone number in database
      await window.verifyUserPhone(user.uid, phone);
      
      // Send verification email
      await user.sendEmailVerification();
      
      // Store in localStorage
      localStorage.setItem('navify-user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: name,
        loggedInAt: Date.now(),
        phoneVerified: true
      }));
      
      closeModal(signUpModal);
      alert('✓ Account created successfully!\n\nPlease check your email to verify your address, then log in to start using Navify.');
      window.location.href = 'index.html';
      
    } catch (err) {
      console.error('Sign-up failed:', err);
      showError(parseFirebaseError(err), errorDiv);
    } finally {
      createAccountBtn.disabled = false;
      createAccountBtn.textContent = 'Create account & Verify Phone';
    }
  });
}

function showError(message, errorDiv) {
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function parseFirebaseError(error) {
  const code = error.code || '';
  if (code.includes('email-already-in-use')) return 'Email already registered';
  if (code.includes('weak-password')) return 'Password is too weak';
  if (code.includes('invalid-email')) return 'Invalid email address';
  return error.message || 'Sign-up failed. Please try again.';
}

document.addEventListener('DOMContentLoaded', bindSignUp);
