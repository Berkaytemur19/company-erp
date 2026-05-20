const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Modelleri yükle ve tabloları oluştur
const sequelize = require('./config/database');
require('./models/User');
require('./models/Department');
require('./models/Inventory');
require('./models/Message');
require('./models/LeaveRequest');
require('./models/Notification');

sequelize.sync({ alter: true })
  .then(() => console.log('Tablolar hazır'))
  .catch(err => console.error('Tablo oluşturma hatası:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server çalışıyor!', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route bulunamadı' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Sunucu hatası' });
});

module.exports = app;
