import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10) || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 MailCraft AI Backend server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`💻 Created by: Harsh Kumar`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
