import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import reviewRoutes from './routes/review.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MailCraft AI API',
    author: 'Harsh Kumar',
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use(errorHandler);

export default app;
