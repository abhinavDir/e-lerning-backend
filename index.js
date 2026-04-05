require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dns = require("dns");
const seedData = require('./utils/seeder');

// Port & DNS Configuration
const app = express();
const PORT = process.env.PORT || 5000;
dns.setDefaultResultOrder("ipv4first");

// Global Middleware
app.use(express.json());
app.use(cors());

// Environment Specific Logging (Dev Mode Only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    if (req.originalUrl.includes('/api/')) {
      console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
  });
}

// MongoDB Connection Logic
mongoose.set('bufferCommands', false); 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedData(); 
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Health Check Route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Active', 
    engine: 'EdStack Intelligence', 
    mode: process.env.NODE_ENV || 'development' 
  });
});

// Route Definitions
const routes = {
  auth: require('./routes/auth'),
  courses: require('./routes/courses'),
  enroll: require('./routes/enrollment'),
  quiz: require('./routes/quiz'),
  ai: require('./routes/ai'),
  topics: require('./routes/topics'),
  analytics: require('./routes/analytics'),
  upload: require('./routes/upload'),
  feedback: require('./routes/feedback'),
  recs: require('./routes/recommendation'),
  code: require('./routes/code'),
  chat: require('./routes/chat')
};

// Mount API Endpoints
app.use('/api/auth', routes.auth);
app.use('/api/courses', routes.courses);
app.use('/api/enroll', routes.enroll);
app.use('/api/quiz', routes.quiz);
app.use('/api/ai', routes.ai);
app.use('/api/topics', routes.topics);
app.use('/api/analytics', routes.analytics);
app.use('/api/upload', routes.upload);
app.use('/api/feedback', routes.feedback);
app.use('/api/recommendations', routes.recs);
app.use('/api/code', routes.code);
app.use('/api/chat', routes.chat);

// Static Assets & Error Handling
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Logic Error',
    message: process.env.NODE_ENV === 'production' ? 'Contact Support' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 NEURAL HUB ACTIVATED [PORT: ${PORT}]`);
  console.log(`🧠 AI ENGINE: ONLINE | NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ PORT ${PORT} IS BLOCKED!`);
  } else {
    console.error('❌ Startup failed:', err);
  }
});
