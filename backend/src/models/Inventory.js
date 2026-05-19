const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  sku: { type: DataTypes.STRING, unique: true },
  category: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  unit_price: DataTypes.DECIMAL(10, 2),
  reorder_level: DataTypes.INTEGER,
  warehouse_location: DataTypes.STRING,
  image_url: DataTypes.STRING,
  added_by: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true, underscored: true, tableName: 'inventory' });

module.exports = Inventory;
