function bindSignIn() {
  const signInBtn = document.getElementById('signInBtn');
  const signInModal = document.getElementById('signInModal');
  const enterAppBtn = document.getElementById('enterAppBtn');
  const emailInput = signInModal?.querySelector('#signInEmail');
  const passwordInput = signInModal?.querySelector('#signInPassword');
  const rememberMeCheckbox = signInModal?.querySelector('#rememberMeCheckbox');
  const signInError = signInModal?.querySelector('#signInError');
  const socials = signInModal?.querySelectorAll('.social-btn');
  const authScreen = document.getElementById('authScreen');

  // Load saved email if "Remember Me" was previously checked - run immediately and on DOMContentLoaded
  function loadSavedEmail() {
    const savedEmail = localStorage.getItem('navify-saved-email');
    if (savedEmail && emailInput) {
      emailInput.value = savedEmail;
      if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = true;
      }
    }
  }
  
  // Try loading immediately
  loadSavedEmail();
  
  // Also try on DOMContentLoaded in case elements weren't ready
  document.addEventListener('DOMContentLoaded', loadSavedEmail);

  function showSignInError(message) {
    if (signInError) {
      signInError.textContent = message;
      signInError.style.display = 'block';
    }
  }

  function hideSignInError() {
    if (signInError) {
      signInError.style.display = 'none';
    }
  }

  signInBtn?.addEventListener('click', () => {
    hideSignInError();
    openModal(signInModal);
  });

  enterAppBtn?.addEventListener('click', async () => {
    hideSignInError();
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox?.checked || false;

    if (!email || !password) {
      showSignInError('Please enter your email and password.');
      return;
    }

    if (!email.includes('@')) {
      showSignInError('Please enter a valid email address.');
      return;
    }

    try {
      // Check if Firebase is initialized
      if (!window.navifyAuth) {
        showSignInError('Firebase authentication not initialized. Please refresh the page.');
        return;
      }

      enterAppBtn.disabled = true;
      enterAppBtn.textContent = 'Signing in...';

      // Sign in with email and password
      let user;
      try {
        user = await navifyEmailSignIn(email, password);
      } catch (firebaseErr) {
        console.error('Sign-in error:', firebaseErr);
        throw firebaseErr;
      }

      // Check if phone is verified
      if (!user.phoneNumber) {
        console.warn('Note: User phone number not yet verified in Firebase');
      }

      // Save email if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('navify-saved-email', email);
        localStorage.setItem('navify-remember-me', 'true');
      } else {
        localStorage.removeItem('navify-saved-email');
        localStorage.removeItem('navify-remember-me');
      }

      closeModal(signInModal);
      authScreen?.setAttribute('hidden', 'true');
      window.location.href = 'pages/home.html';
    } catch (err) {
      console.error('Email sign-in failed', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'Sign in failed. Check your details or try again.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSignInError(errorMessage);
    } finally {
      enterAppBtn.disabled = false;
      enterAppBtn.textContent = 'Enter App';
    }
  });

  if (socials && socials.length) {
    socials.forEach((btn) => {
      const label = btn.textContent?.toLowerCase().trim();
      if (label === 'google') {
        btn.addEventListener('click', async () => {
          try {
            hideSignInError();
            enterAppBtn.disabled = true;
            await navifyGoogleSignIn();
            closeModal(signInModal);
            authScreen?.setAttribute('hidden', 'true');
            window.location.href = 'pages/home.html';
          } catch (err) {
            console.error('Google sign-in failed', err);
            showSignInError('Google sign-in failed. Please check your Firebase configuration.');
          } finally {
            enterAppBtn.disabled = false;
          }
        });
      }
      if (label === 'facebook') {
        btn.addEventListener('click', async () => {
          try {
            hideSignInError();
            enterAppBtn.disabled = true;
            await navifyFacebookSignIn();
            closeModal(signInModal);
            authScreen?.setAttribute('hidden', 'true');
            window.location.href = 'pages/home.html';
          } catch (err) {
            console.error('Facebook sign-in failed', err);
            showSignInError('Facebook sign-in failed. Please check your Firebase configuration.');
          } finally {
            enterAppBtn.disabled = false;
          }
        });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', bindSignIn);
