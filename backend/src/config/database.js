const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'company_erp',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

sequelize.authenticate()
  .then(() => console.log('Veritabanı bağlandı'))
  .catch(err => console.error('Veritabanı bağlantı hatası:', err.message));

module.exports = sequelize;
