import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import photoRoutes from './routes/photoRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security

// Allow requests from your frontend (adjust origin as needed)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
}));

// Logging Middleware
app.use(morgan('combined')); // Logs HTTP requests and errors

// Rate Limiting Middleware to protect against brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);

// Body Parsing Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/photos', photoRoutes);  // Ensure this matches your export
app.use('/api/v1/auth', authRoutes);      // Ensure this matches your export

// Handle 404 for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Internal Server Error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

export default app;