const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { validateEnvironment } = require('./utils/envValidator');

dotenv.config();

// Validate environment variables
if (!validateEnvironment()) {
  process.exit(1);
}

const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api', notesRoutes);
app.use('/api', bookmarkRoutes);
app.use('/api', userRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'NoteHub API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to MongoDB with connection pooling options
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    console.log('✓ MongoDB connected successfully');

    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('✗ Server startup failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('✗ Could not connect to MongoDB. Ensure MongoDB is running at:', process.env.MONGO_URI);
    }
    process.exit(1);
  }
}

startServer();
