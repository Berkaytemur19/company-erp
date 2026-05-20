const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const employees = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    if (!employee) return res.status(404).json({ error: 'Çalışan bulunamadı' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const employee = await User.create({ email, password_hash, first_name, last_name, phone, role: role || 'employee' });
    res.status(201).json({ id: employee.id, email: employee.email, first_name: employee.first_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await User.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Çalışan bulunamadı' });

    const { first_name, last_name, phone, avatar_url, role, department_id } = req.body;
    await employee.update({ first_name, last_name, phone, avatar_url, role, department_id });
    const updated = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const employee = await User.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Çalışan bulunamadı' });
    await employee.destroy();
    res.json({ message: 'Çalışan silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
