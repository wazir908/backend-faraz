import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import employeeRoutes from './routes/employees.js';
import recruitmentRoutes from './routes/Recruitment.js';
import notificationRoutes from './routes/notifications.js';
import authRoutes from './routes/auth.js'; // 🔥 Your custom simple login logic
import Applicant from './models/Applicant.js';

dotenv.config();

// App + Server + Socket
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store io instance
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Static file path (for resumes)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect MongoDB
connectDB();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// 🚀 Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/recruitments', recruitmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes); // ✅ Simplified auth

// Job application submission
app.post('/api/recruitments/:jobId/applicants', upload.single('resume'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const jobId = req.params.jobId;
    const resumePath = req.file?.path.replace(/\\/g, '/');

    if (!name || !email || !resumePath) {
      return res.status(400).json({ message: 'Name, email, and resume are required.' });
    }

    const applicant = new Applicant({ name, email, resume: resumePath, jobId });
    await applicant.save();

    io.emit('notification', {
      message: `📥 New applicant: ${name} for job ID: ${jobId}`,
    });

    res.status(200).json({
      message: '✅ Application submitted successfully.',
      data: applicant,
    });
  } catch (error) {
    console.error('❌ Applicant error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 API is up and running!');
});

// Socket connections
io.on('connection', (socket) => {
  console.log('📡 Socket.io connected');

  socket.on('disconnect', () => {
    console.log('🔌 Socket.io disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Handle promise errors
process.on('unhandledRejection', (err) => {
  console.error('🛑 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
