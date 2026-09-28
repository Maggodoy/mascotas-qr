const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la autenticación del usuario mediante JWT.
 */
const verifyToken = (req, res, next) => {
  // Extraer el encabezado Authorization
  const authHeader = req.headers['authorization'];

  // El token suele venir en formato: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Acceso denegado. No se proporcionó un token de autenticación.'
    });
  }

  try {
    // Verificar y decodificar el token usando la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inyectamos el ID del usuario en el objeto request para que los controladores puedan usarlo
    req.user = decoded;

    next(); // Permitir el paso al siguiente middleware o controlador
  } catch (error) {
    console.error('Error al verificar el token JWT:', error.message);
    return res.status(403).json({
      status: 'error',
      message: 'Token inválido o expirado.'
    });
  }
};

module.exports = verifyToken;