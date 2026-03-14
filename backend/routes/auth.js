const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const https = require('https');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://agentpilot-liard.vercel.app';

// ──── Passport (only for Google OAuth flow) ────
passport.use(new LocalStrategy(
  { usernameField: 'username' },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user) return done(null, false, { message: 'No account with that username.' });
      if (!user.password) return done(null, false, { message: 'Please sign in with Google.' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://agentpilot.onrender.com/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value || '';
        await user.save();
        return done(null, user);
      }

      const baseUsername = profile.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      let finalUsername = baseUsername;
      let count = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = baseUsername + count++;
      }

      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        username: finalUsername,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value || ''
      });
      return done(null, user);
    } catch (err) { return done(err); }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (err) { done(err); }
});

// ──── JWT Helper ────
function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, username: user.username, email: user.email, avatar: user.avatar, googleId: user.googleId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ──── JWT Auth Middleware ────
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ──── API Routes ────

// GET /api/me — verify token and return user
router.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/login
router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { name: user.name, username: user.username, email: user.email, avatar: user.avatar, googleId: user.googleId } });
  })(req, res, next);
});

// POST /api/signup
router.post('/api/signup', async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ error: 'Please fill in all fields.' });
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return res.status(400).json({ error: 'Username can only have letters, numbers, and underscores.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ error: 'Email already registered.' });
    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(400).json({ error: 'Username already taken.' });

    await User.create({ name, username: username.toLowerCase(), email, password });
    res.json({ success: true, message: 'Account created! Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// POST /api/logout — JWT is stateless, just tell client to delete token
router.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// ──── Google OAuth ────
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    const token = signToken(req.user);
    console.log('Google OAuth success for:', req.user.email);
    // Redirect to frontend with token in URL — frontend stores it in localStorage
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// ──── Groq API Proxy ────
router.post('/api/agent', requireAuth, (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured.' });

  const { system, messages, max_tokens } = req.body;
  const groqMessages = [];
  if (system) groqMessages.push({ role: 'system', content: system });
  if (messages) groqMessages.push(...messages);

  const groqBody = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    max_tokens: max_tokens || 1000,
    temperature: 0.7,
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(groqBody)
    }
  };

  let rawData = '';
  const proxyReq = https.request(options, (proxyRes) => {
    proxyRes.on('data', chunk => rawData += chunk);
    proxyRes.on('end', () => {
      try {
        const groqResponse = JSON.parse(rawData);
        if (groqResponse.error) return res.status(proxyRes.statusCode).json({ error: groqResponse.error.message });
        const text = groqResponse.choices?.[0]?.message?.content || 'No response.';
        res.json({ content: [{ type: 'text', text }] });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse Groq response: ' + e.message });
      }
    });
  });

  proxyReq.on('error', (err) => {
    console.error('Groq proxy error:', err);
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  });

  proxyReq.write(groqBody);
  proxyReq.end();
});

module.exports = router;
