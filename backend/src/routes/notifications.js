const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// Kullanıcının bildirimleri
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 30,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Okunmamış sayısı
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tek bildirimi okundu işaretle
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notif) return res.status(404).json({ error: 'Bildirim bulunamadı' });
    await notif.update({ is_read: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tümünü okundu işaretle
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ message: 'Tümü okundu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
