// server.js

const express = require('express');
const connectDB = require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Authentication routes
const taskRoutes = require('./routes/task');  // Task routes
const path = require('path');

dotenv.config();  // Load environment variables

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json());  // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from your frontend
  methods: ['GET', 'POST', 'DELETE'],  // Allow GET, POST, DELETE methods
  credentials: true  // Allow credentials (cookies, authorization headers, etc.)
}));

// Route setup
app.use('/auth', authRoutes);  // Authentication routes
app.use('/api', taskRoutes);   // Task routes

// Serve uploaded files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
