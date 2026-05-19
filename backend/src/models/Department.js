const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  manager_id: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true, underscored: true, tableName: 'departments' });

module.exports = Department;
