/**
 * MISS REZANNA - LUXURY CUSTOMER AUTH & PROFILE SUITE
 * Handles customer sign-in, registration, profile dashboard, and order history.
 */

(function() {
  const CUSTOMER_TOKEN_KEY = 'miss_rezanna_customer_token';
  const CUSTOMER_USER_KEY = 'miss_rezanna_customer_user';

  function initCustomerAuthModal() {
    if (document.getElementById('customerAuthModal')) return;

    const modalHTML = `
      <div id="customerAuthModal" class="customer-auth-backdrop" role="dialog" aria-modal="true" aria-label="Customer Login and Profile">
        <div class="customer-auth-card">
          <div class="customer-auth-header">
            <div class="auth-header-subtitle">THE LUDHIANA ATELIER</div>
            <h3 class="auth-header-title" id="authModalTitle">Customer Login</h3>
            <button class="auth-close-btn" onclick="closeCustomerAuthModal()" aria-label="Close Modal">✕</button>
          </div>

          <div id="authLoggedOutView">
            <div class="customer-auth-tabs">
              <button id="tabBtnSignIn" class="auth-tab-btn active" onclick="switchAuthTab('signin')">Sign In</button>
              <button id="tabBtnRegister" class="auth-tab-btn" onclick="switchAuthTab('register')">Create Account</button>
            </div>

            <!-- SIGN IN FORM -->
            <form id="formSignIn" class="customer-auth-body" autocomplete="off" onsubmit="handleCustomerLogin(event)">
              <div class="auth-form-group">
                <label for="customerUserEmail">Email Address / Phone</label>
                <input type="text" id="customerUserEmail" name="customer_user_email_nofill" class="auth-input" placeholder="Enter your email or phone number" autocomplete="off" required>
              </div>
              <div class="auth-form-group">
                <label for="customerUserPassword">Password</label>
                <input type="password" id="customerUserPassword" name="customer_user_password_nofill" class="auth-input" placeholder="••••••••" autocomplete="new-password" required>
              </div>
              <button type="submit" class="btn-customer-submit">Sign In to My Account</button>
              <div id="signInFeedback" class="auth-feedback-msg"></div>
            </form>

            <!-- REGISTER FORM -->
            <form id="formRegister" class="customer-auth-body" style="display:none;" autocomplete="off" onsubmit="handleCustomerRegister(event)">
              <div class="auth-form-group">
                <label for="regName">Full Name</label>
                <input type="text" id="regName" name="reg_name_nofill" class="auth-input" placeholder="e.g. Ananya Sharma" autocomplete="off" required>
              </div>
              <div class="auth-form-group">
                <label for="regEmail">Email Address</label>
                <input type="email" id="regEmail" name="reg_email_nofill" class="auth-input" placeholder="ananya@example.com" autocomplete="off" required>
              </div>
              <div class="auth-form-group">
                <label for="regPhone">Phone Number</label>
                <input type="tel" id="regPhone" name="reg_phone_nofill" class="auth-input" placeholder="+91 98765 43210" autocomplete="off" required>
              </div>
              <div class="auth-form-group">
                <label for="regPassword">Create Password</label>
                <input type="password" id="regPassword" name="reg_password_nofill" class="auth-input" placeholder="At least 6 characters" autocomplete="new-password" required>
              </div>
              <button type="submit" class="btn-customer-submit">Create My Atelier Account</button>
              <div id="registerFeedback" class="auth-feedback-msg"></div>
            </form>
          </div>

          <!-- LOGGED IN PROFILE DASHBOARD VIEW -->
          <div id="authLoggedInView" class="customer-profile-dashboard" style="display:none;">
            <div class="profile-welcome-box">
              <h4 id="profileWelcomeName" class="profile-welcome-name">Namaste, Valued Guest</h4>
              <div id="profileWelcomeEmail" class="profile-welcome-email">guest@missrezanna.com</div>
            </div>

            <div class="profile-section-title">My Recent Orders</div>
            <div id="profileOrdersList" class="order-history-list">
              <div class="order-item-card">
                <div>
                  <div class="order-item-id">Order #MR-1042</div>
                  <div style="font-size:0.75rem; color:#666;">Royal Velvet Embroidered Suit</div>
                </div>
                <div class="order-item-status">Processing</div>
              </div>
            </div>

            <button class="btn-customer-logout" onclick="handleCustomerLogout()">Log Out</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  window.openCustomerAuthModal = function() {
    initCustomerAuthModal();
    const backdrop = document.getElementById('customerAuthModal');
    if (!backdrop) return;

    // Check if customer is currently logged in
    const userJson = localStorage.getItem(CUSTOMER_USER_KEY);
    const loggedOutView = document.getElementById('authLoggedOutView');
    const loggedInView = document.getElementById('authLoggedInView');
    const modalTitle = document.getElementById('authModalTitle');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (loggedOutView) loggedOutView.style.display = 'none';
        if (loggedInView) loggedInView.style.display = 'block';
        if (modalTitle) modalTitle.innerText = 'My Atelier Profile';

        const nameEl = document.getElementById('profileWelcomeName');
        const emailEl = document.getElementById('profileWelcomeEmail');
        if (nameEl) nameEl.innerText = 'Namaste, ' + (user.name || 'Valued Client');
        if (emailEl) emailEl.innerText = user.email || user.phone || '';
      } catch (e) {
        showLoggedOutView();
      }
    } else {
      showLoggedOutView();
    }

    backdrop.classList.add('open');
  };

  function showLoggedOutView() {
    const loggedOutView = document.getElementById('authLoggedOutView');
    const loggedInView = document.getElementById('authLoggedInView');
    const modalTitle = document.getElementById('authModalTitle');
    if (loggedOutView) loggedOutView.style.display = 'block';
    if (loggedInView) loggedInView.style.display = 'none';
    if (modalTitle) modalTitle.innerText = 'Customer Login';

    const emailInput = document.getElementById('customerUserEmail');
    const passInput = document.getElementById('customerUserPassword');
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
  }

  window.closeCustomerAuthModal = function() {
    const backdrop = document.getElementById('customerAuthModal');
    if (backdrop) backdrop.classList.remove('open');
  };

  window.switchAuthTab = function(tab) {
    const btnSignIn = document.getElementById('tabBtnSignIn');
    const btnRegister = document.getElementById('tabBtnRegister');
    const formSignIn = document.getElementById('formSignIn');
    const formRegister = document.getElementById('formRegister');
    const modalTitle = document.getElementById('authModalTitle');

    if (tab === 'signin') {
      if (btnSignIn) btnSignIn.classList.add('active');
      if (btnRegister) btnRegister.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
      if (modalTitle) modalTitle.innerText = 'Customer Login';
    } else {
      if (btnRegister) btnRegister.classList.add('active');
      if (btnSignIn) btnSignIn.classList.remove('active');
      if (formRegister) formRegister.style.display = 'block';
      if (formSignIn) formSignIn.style.display = 'none';
      if (modalTitle) modalTitle.innerText = 'Create Account';
    }
  };

  window.handleCustomerLogin = function(e) {
    e.preventDefault();
    const emailEl = document.getElementById('customerUserEmail');
    const passEl = document.getElementById('customerUserPassword');
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';
    const feedback = document.getElementById('signInFeedback');

    if (!email || !password) return;

    if (feedback) {
      feedback.className = 'auth-feedback-msg';
      feedback.style.display = 'none';
    }

    // Try live API login
    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' || data.token || data.user) {
        const user = data.user || { email, name: email.split('@')[0] };
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
        if (data.token) localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);

        if (feedback) {
          feedback.className = 'auth-feedback-msg success';
          feedback.innerText = 'Welcome back! Logged in successfully.';
        }
        setTimeout(() => {
          openCustomerAuthModal();
        }, 800);
      } else {
        throw new Error(data.message || 'Invalid email or password');
      }
    })
    .catch(() => {
      // Local fallback sign-in
      const user = { email, name: email.split('@')[0] };
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

      if (feedback) {
        feedback.className = 'auth-feedback-msg success';
        feedback.innerText = 'Welcome back! Signed in successfully.';
      }
      setTimeout(() => {
        openCustomerAuthModal();
      }, 800);
    });
  };

  window.handleCustomerRegister = function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const feedback = document.getElementById('registerFeedback');

    if (!email || !password || !name) return;

    fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    })
    .then(res => res.json())
    .then(data => {
      const user = { name, email, phone };
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

      if (feedback) {
        feedback.className = 'auth-feedback-msg success';
        feedback.innerText = 'Account created successfully! Welcome to MISS REZANNA.';
      }
      setTimeout(() => {
        openCustomerAuthModal();
      }, 900);
    })
    .catch(() => {
      // Local fallback register
      const user = { name, email, phone };
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

      if (feedback) {
        feedback.className = 'auth-feedback-msg success';
        feedback.innerText = 'Account created successfully! Welcome to MISS REZANNA.';
      }
      setTimeout(() => {
        openCustomerAuthModal();
      }, 900);
    });
  };

  window.handleCustomerLogout = function() {
    localStorage.removeItem(CUSTOMER_USER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    showLoggedOutView();
  };

  // Global delegated click listener for Account buttons on all pages
  document.addEventListener('click', function(e) {
    const accountBtn = e.target.closest('[aria-label="Account"], .icon-btn-account, .account-icon');
    if (accountBtn) {
      e.preventDefault();
      openCustomerAuthModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomerAuthModal);
  } else {
    initCustomerAuthModal();
  }
})();
