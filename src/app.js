const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const petRoutes = require('./routes/petRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      message: 'API funcionando y conectada a PostgreSQL en Supabase',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Error en healthcheck:', error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Registrar módulos de la API
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});