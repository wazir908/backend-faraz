import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Send + Save Notification
router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const newNotification = await Notification.create({ message });

    // Emit via Socket
    req.app.get('io').emit('notification', { message });

    res.status(201).json({ success: true, notification: newNotification });
  } catch (error) {
    console.error('Error saving notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
});

// Fetch All Notifications
router.get('/', async (req, res) => {
  try {
    const allNotifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(allNotifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
