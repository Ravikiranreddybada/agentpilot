const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// ──── Middleware ────
function ensureGuest(req, res, next) {
  if (req.isAuthenticated()) return res.status(400).json({ message: 'Already logged in' });
  next();
}

function ensureAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// ──── API Routes ────

// Get current user (for checking session)
router.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
});

// Home page data
router.get('/api/home', (req, res) => {
  res.json({ 
    message: 'Agent Pilot - LLM Based Agentic AI Platform',
    authenticated: req.isAuthenticated()
  });
});

// Login page data (check if already logged in)
router.get('/api/login', ensureGuest, (req, res) => {
  res.json({ 
    message: 'Login page',
    authenticated: false
  });
});

// Signup page data
router.get('/api/signup', ensureGuest, (req, res) => {
  res.json({ 
    message: 'Signup page',
    authenticated: false
  });
});

// Dashboard data (protected)
router.get('/api/dashboard', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

// ──── Local Auth - Login with username + password ────
router.post('/api/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ 
        user: { 
          name: user.name, 
          username: user.username, 
          email: user.email,
          avatar: user.avatar,
          googleId: user.googleId
        } 
      });
    });
  })(req, res, next);
});

// ──── Signup with all fields ────
router.post('/api/signup', ensureGuest, async (req, res) => {
  try {
    const { name, username, email, phone, password, confirmPassword } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    // Username validation - only letters, numbers, underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only have letters, numbers, and underscores.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken. Please choose another.' });
    }

    await User.create({ name, username: username.toLowerCase(), email, phone, password });
    res.json({ success: true, message: 'Account created! Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// ──── Google Auth ────
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login?error=google_auth_failed',
    failureFlash: true
  }),
  (req, res) => {
    // Successful authentication, redirect to React dashboard
    res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '/dashboard');
  }
);

// ──── Logout ────
router.post('/api/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;


// ──── Anthropic API Proxy (keeps API key server-side) ────
const https = require('https');

router.post('/api/agent', ensureAuth, (req, res) => {
  const body = JSON.stringify(req.body);
  const apiKey = process.env.ANTHROPIC_API_KEY || '';

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});
