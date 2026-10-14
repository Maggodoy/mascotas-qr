const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la autenticación del usuario mediante JWT.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Validar existencia y formato "Bearer <token>"
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Acceso denegado. No se proporcionó un token de autenticación válido.'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return res.status(401).json({
      status: 'error',
      message: 'Token no válido o no proporcionado.'
    });
  }

  try {
    // Verificar y decodificar el token usando la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inyectamos el usuario decodificado en el objeto request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error al verificar el token JWT:', error.message);
    return res.status(403).json({
      status: 'error',
      message: 'Token inválido o expirado.'
    });
  }
};

module.exports = verifyToken;