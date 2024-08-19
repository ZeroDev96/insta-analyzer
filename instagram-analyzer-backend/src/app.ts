import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import photoRoutes from './routes/photoRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
}));

// Logging Middleware
app.use(morgan('combined'));

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/photos', photoRoutes);  // Using the photo routes
app.use('/api/v1/auth', authRoutes);      // Using the auth routes

// Handle 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handling Middleware
app.use((err, _req, res, _next) => {
  console.error('Internal Server Error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

export default app;