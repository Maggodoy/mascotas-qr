const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/register
 * Registra un nuevo dueño de mascota
 */
const register = async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  // Validación básica de campos requeridos
  if (!nombre || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Nombre, email y contraseña son obligatorios.'
    });
  }

  try {
    // 1. Verificar si el email ya existe en la base de datos
    const userCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado.'
      });
    }

    // 2. Encriptar la contraseña (hash)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Guardar el nuevo usuario en Supabase
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, telefono)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, telefono, creado_en;
    `;
    const values = [nombre, email.toLowerCase(), passwordHash, telefono || null];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    // 4. Generar el token JWT de acceso inmediato
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Expira en 7 días
    );

    return res.status(201).json({
      status: 'success',
      message: 'Usuario registrado con éxito.',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al registrar el usuario.'
    });
  }
};

/**
 * POST /api/auth/login
 * Inicia sesión del usuario y retorna el JWT
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Debes proporcionar email y contraseña.'
    });
  }

  try {
    // 1. Buscar el usuario por email
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas.'
      });
    }

    const user = result.rows[0];

    // 2. Comparar la contraseña provista con el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas.'
      });
    }

    // 3. Generar el token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso.',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al iniciar sesión.'
    });
  }
};

module.exports = {
  register,
  login
};