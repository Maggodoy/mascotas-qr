const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const petRoutes = require('./routes/petRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir peticiones desde React (Vite / CRA)
app.use(cors({
  origin: '*', // En desarrollo permite peticiones de cualquier origen
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Registrar módulos
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// Manejo de errores global en JSON
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});