import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import chalk from 'chalk'; // Import chalk
import morgan from 'morgan'; // Import morgan for logging
import FileStore from 'session-file-store'; // File-based session storage
import configurePassport from './config/passport.js';
import authRouter from './routes/auth.js';
import { connectDb } from './config/db.js';
import projectRouter from './routes/project.js';
import imageRouter from './routes/image.js';
import path from 'path';

dotenv.config();

const app = express();
const fileStore = FileStore(session);

// Database connection
connectDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(new URL(import.meta.url).pathname, 'uploads')));

// Logging with morgan
app.use(
  morgan('combined', {
    stream: {
      write: (message) => console.log(chalk.green(message.trim())),
    },
  })
);

// Session setup with file-based JSON storage
app.use(
  session({
    store: new fileStore({
      path: './sessions', // Directory to save session files
      ttl: 86400, // Time to live (in seconds) for session files
      retries: 2, // Retry attempts to write session
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', authRouter);
app.use('/api', projectRouter);
app.use('/api', imageRouter);

// Test route for authentication
app.get('/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    console.log(chalk.red('Unauthorized access attempt to /protected'));
    return res.status(401).send('Access denied');
  }
  console.log(chalk.blue(`User authenticated: ${req.user.username}`));
  res.send('This is a protected route');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(chalk.cyanBright(`🚀 Server running on port http://localhost:${PORT}`))
);
