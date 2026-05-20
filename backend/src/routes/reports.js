const express = require('express');
const router = express.Router();
const { authMiddleware, managerOrAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const LeaveRequest = require('../models/LeaveRequest');
const Department = require('../models/Department');
const { Op } = require('sequelize');

// Genel özet
router.get('/summary', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const [totalEmployees, totalItems, pendingLeaves, departments] = await Promise.all([
      User.count(),
      Inventory.count(),
      LeaveRequest.count({ where: { status: 'pending' } }),
      Department.count(),
    ]);

    const inventoryItems = await Inventory.findAll({ attributes: ['quantity', 'unit_price'] });
    const totalInventoryValue = inventoryItems.reduce((sum, i) => {
      return sum + (Number(i.quantity) * Number(i.unit_price || 0));
    }, 0);

    const lowStockItems = await Inventory.findAll({
      where: {
        reorder_level: { [Op.not]: null },
        [Op.and]: [{ quantity: { [Op.lte]: Inventory.sequelize.literal('reorder_level') } }],
      },
    });

    res.json({
      totalEmployees,
      totalItems,
      pendingLeaves,
      departments,
      totalInventoryValue: totalInventoryValue.toFixed(2),
      lowStockCount: lowStockItems.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Departmana göre çalışan dağılımı
router.get('/employees-by-department', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const departments = await Department.findAll();
    const employees = await User.findAll({ attributes: ['id', 'department_id', 'role'] });

    const data = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(e => e.department_id === dept.id).length,
    }));

    const unassigned = employees.filter(e => !e.department_id).length;
    if (unassigned > 0) data.push({ name: 'Atanmamış', count: unassigned });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kategoriye göre envanter
router.get('/inventory-by-category', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const items = await Inventory.findAll({ attributes: ['category', 'quantity', 'unit_price'] });

    const categoryMap = {};
    items.forEach(item => {
      const cat = item.category || 'Kategorisiz';
      if (!categoryMap[cat]) categoryMap[cat] = { name: cat, count: 0, value: 0 };
      categoryMap[cat].count += Number(item.quantity);
      categoryMap[cat].value += Number(item.quantity) * Number(item.unit_price || 0);
    });

    const data = Object.values(categoryMap).map(c => ({ ...c, value: parseFloat(c.value.toFixed(2)) }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aylık izin istatistiği (son 6 ay)
router.get('/leaves-monthly', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const leaves = await LeaveRequest.findAll({
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      attributes: ['status', 'created_at'],
    });

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        pending: 0, approved: 0, rejected: 0,
      });
    }

    leaves.forEach(l => {
      const d = new Date(l.created_at);
      const m = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
      if (m) m[l.status]++;
    });

    res.json(months.map(({ month, pending, approved, rejected }) => ({ month, pending, approved, rejected })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rol dağılımı
router.get('/employees-by-role', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const employees = await User.findAll({ attributes: ['role'] });
    const roleMap = {};
    employees.forEach(e => {
      roleMap[e.role] = (roleMap[e.role] || 0) + 1;
    });
    const data = Object.entries(roleMap).map(([name, value]) => ({ name, value }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
