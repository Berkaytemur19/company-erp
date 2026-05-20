const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware, managerOrAdmin } = require('../middleware/auth');

// İzin listesi — admin/manager hepsini görür, çalışan sadece kendi
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = ['admin', 'manager'].includes(req.user.role) ? {} : { user_id: req.user.id };
    const leaves = await LeaveRequest.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    // Kullanıcı bilgilerini ekle
    const users = await User.findAll({ attributes: ['id', 'first_name', 'last_name', 'email', 'role'] });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const result = leaves.map(l => ({
      ...l.toJSON(),
      user: userMap[l.user_id] || null,
      reviewer: l.reviewed_by ? userMap[l.reviewed_by] || null : null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni izin talebi oluştur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, start_date, end_date, reason } = req.body;
    if (!start_date || !end_date) return res.status(400).json({ error: 'Başlangıç ve bitiş tarihi gerekli' });
    if (new Date(start_date) > new Date(end_date)) return res.status(400).json({ error: 'Başlangıç tarihi bitiş tarihinden sonra olamaz' });

    const leave = await LeaveRequest.create({
      user_id: req.user.id, type, start_date, end_date, reason,
    });

    // Yöneticilere bildirim gönder
    const managers = await User.findAll({ where: { role: ['admin', 'manager'] } });
    const requester = await User.findByPk(req.user.id, { attributes: ['first_name', 'last_name'] });
    await Promise.all(managers.map(m =>
      Notification.create({
        user_id: m.id,
        type: 'leave_request',
        title: 'Yeni İzin Talebi',
        body: `${requester.first_name} ${requester.last_name} izin talebi oluşturdu.`,
        data: { leave_id: leave.id },
      })
    ));

    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Onayla
router.put('/:id/approve', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Talep bulunamadı' });
    if (leave.status !== 'pending') return res.status(400).json({ error: 'Bu talep zaten işlenmiş' });

    await leave.update({ status: 'approved', reviewed_by: req.user.id, reviewed_at: new Date() });

    await Notification.create({
      user_id: leave.user_id,
      type: 'leave_approved',
      title: 'İzin Talebiniz Onaylandı',
      body: `${leave.start_date} - ${leave.end_date} tarihleri arası izin talebiniz onaylandı.`,
      data: { leave_id: leave.id },
    });

    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reddet
router.put('/:id/reject', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Talep bulunamadı' });
    if (leave.status !== 'pending') return res.status(400).json({ error: 'Bu talep zaten işlenmiş' });

    await leave.update({ status: 'rejected', reviewed_by: req.user.id, reviewed_at: new Date() });

    await Notification.create({
      user_id: leave.user_id,
      type: 'leave_rejected',
      title: 'İzin Talebiniz Reddedildi',
      body: `${leave.start_date} - ${leave.end_date} tarihleri arası izin talebiniz reddedildi.`,
      data: { leave_id: leave.id },
    });

    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// İptal et (sadece bekleyen, sadece kendi)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Talep bulunamadı' });
    if (leave.user_id !== req.user.id && !['admin', 'manager'].includes(req.user.role))
      return res.status(403).json({ error: 'Yetersiz yetki' });
    if (leave.status !== 'pending') return res.status(400).json({ error: 'Sadece bekleyen talepler iptal edilebilir' });

    await leave.destroy();
    res.json({ message: 'Talep iptal edildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
