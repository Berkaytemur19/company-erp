const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.findAll({ order: [['created_at', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.findAll({
      where: {
        reorder_level: { [Op.not]: null },
        [Op.and]: [{ quantity: { [Op.lte]: Inventory.sequelize.literal('reorder_level') } }],
      },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, sku, category, quantity, unit_price, reorder_level, warehouse_location } = req.body;
    const item = await Inventory.create({
      name, description, sku, category, quantity, unit_price, reorder_level, warehouse_location,
      added_by: req.user.id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Ürün bulunamadı' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Ürün bulunamadı' });
    await item.destroy();
    res.json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
