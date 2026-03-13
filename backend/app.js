require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('express-flash');
const cors = require('cors');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ──── CORS for React frontend ────
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));

// ──── Static files ────
app.use(express.static(__dirname + '/public'));

// ──── Middleware ────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ──── Session ────
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/loginpage',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// ──── Passport ────
app.use(passport.initialize());
app.use(passport.session());

// ──── Flash messages ────
app.use(flash());

// ──── Routes ────
app.use('/', authRoutes);

// ──── Health check ────
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ──── Connect to MongoDB & start server ────
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI environment variable is not set.');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
