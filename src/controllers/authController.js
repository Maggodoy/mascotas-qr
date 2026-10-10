const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { email, password, phone } = req.body;

  if (!email || !password || !phone) {
    return res.status(400).json({
      status: 'error',
      message: 'Email, contraseña y teléfono son obligatorios.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado.'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password.trim(), saltRounds);

    const query = `
      INSERT INTO users (email, password_hash, phone)
      VALUES ($1, $2, $3)
      RETURNING id, email, phone, created_at;
    `;
    const values = [cleanEmail, passwordHash, phone.trim()];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
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
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Debes proporcionar email y contraseña.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas.'
      });
    }

    const user = result.rows[0];

    // Compara quitando espacios accidentales en la contraseña
    const isPasswordValid = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas.'
      });
    }

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
          email: user.email,
          phone: user.phone
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

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  // Acepta newPassword o password por si viene nombrado diferente desde el frontend
  const { email } = req.body;
  const newPassword = req.body.newPassword || req.body.password;

  if (!email || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'El correo electrónico y la nueva contraseña son requeridos.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword.trim(), saltRounds);

    const query = `
      UPDATE users 
      SET password_hash = $1 
      WHERE email = $2 
      RETURNING id, email;
    `;
    const result = await pool.query(query, [passwordHash, cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró un usuario con ese correo electrónico.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente.'
    });

  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la contraseña.'
    });
  }
};

module.exports = {
  register,
  login,
  resetPassword
};