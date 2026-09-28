const pool = require('../config/db');

/**
 * GET /api/pets/:qrCode
 * Obtiene la información pública de una mascota según su código QR (PÚBLICO)
 */
const getPetByQrCode = async (req, res) => {
  const { qrCode } = req.params;

  try {
    const query = `
      SELECT 
        p.id AS pet_id,
        p.nombre,
        p.especie,
        p.raza,
        p.foto_url,
        p.es_perdido,
        p.informacion_medica,
        p.instrucciones,
        u.nombre AS dueno_nombre,
        u.telefono AS dueno_telefono,
        u.email AS dueno_email
      FROM mascotas p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.codigo_qr = $1;
    `;

    const result = await pool.query(query, [qrCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró ninguna mascota asociada a este código QR.'
      });
    }

    const pet = result.rows[0];

    // Log de escaneo asíncrono
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    pool.query(
      `INSERT INTO registros_de_escaneo (mascota_id, direccion_ip, user_agent) VALUES ($1, $2, $3)`,
      [pet.pet_id, ip, userAgent]
    ).catch(err => console.error('Error al registrar log de escaneo:', err));

    return res.status(200).json({
      status: 'success',
      data: pet
    });

  } catch (error) {
    console.error('Error al consultar mascota por QR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al procesar la solicitud.'
    });
  }
};

/**
 * POST /api/pets
 * Crea una nueva mascota asociada al usuario autenticado (PROTEGIDO)
 */
const createPet = async (req, res) => {
  const usuario_id = req.user.id; // Extraído desde el token por authMiddleware
  const { nombre, especie, raza, foto_url, informacion_medica, instrucciones, codigo_qr } = req.body;

  if (!nombre || !codigo_qr) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre y el código QR son requeridos.'
    });
  }

  try {
    const query = `
      INSERT INTO mascotas (usuario_id, nombre, especie, raza, foto_url, informacion_medica, instrucciones, codigo_qr)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [usuario_id, nombre, especie, raza, foto_url, informacion_medica, instrucciones, codigo_qr];
    const result = await pool.query(query, values);

    return res.status(201).json({
      status: 'success',
      message: 'Mascota registrada correctamente.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear mascota:', error);
    if (error.code === '23505') { // Violación de unicidad en PostgreSQL
      return res.status(400).json({ status: 'error', message: 'El código QR ingresado ya está asignado a otra mascota.' });
    }
    return res.status(500).json({ status: 'error', message: 'Error al registrar la mascota.' });
  }
};

/**
 * GET /api/pets
 * Lista todas las mascotas pertenecientes al usuario autenticado (PROTEGIDO)
 */
const getMyPets = async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM mascotas WHERE usuario_id = $1 ORDER BY creado_en DESC', [usuario_id]);
    return res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener mis mascotas:', error);
    return res.status(500).json({ status: 'error', message: 'Error al obtener la lista de mascotas.' });
  }
};

/**
 * PUT /api/pets/:id
 * Actualiza los datos de una mascota (PROTEGIDO - Solo el dueño)
 */
const updatePet = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const { nombre, especie, raza, foto_url, es_perdido, informacion_medica, instrucciones } = req.body;

  try {
    // Verificar que la mascota pertenece al usuario
    const petCheck = await pool.query('SELECT id FROM mascotas WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);
    if (petCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Mascota no encontrada o no tienes permisos para editarla.' });
    }

    const query = `
      UPDATE mascotas 
      SET 
        nombre = COALESCE($1, nombre),
        especie = COALESCE($2, especie),
        raza = COALESCE($3, raza),
        foto_url = COALESCE($4, foto_url),
        es_perdido = COALESCE($5, es_perdido),
        informacion_medica = COALESCE($6, informacion_medica),
        instrucciones = COALESCE($7, instrucciones)
      WHERE id = $8 AND usuario_id = $9
      RETURNING *;
    `;

    const values = [nombre, especie, raza, foto_url, es_perdido, informacion_medica, instrucciones, id, usuario_id];
    const result = await pool.query(query, values);

    return res.status(200).json({
      status: 'success',
      message: 'Mascota actualizada correctamente.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    return res.status(500).json({ status: 'error', message: 'Error al actualizar la información de la mascota.' });
  }
};

module.exports = {
  getPetByQrCode,
  createPet,
  getMyPets,
  updatePet
};