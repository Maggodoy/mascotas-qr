const pool = require('../config/db');

/**
 * GET /api/pets/scan/:qrCode
 */
const getPetByQrCode = async (req, res) => {
  const { qrCode } = req.params;

  try {
    const query = `
      SELECT 
        p.id AS pet_id,
        p.name,
        p.photo_url,
        p.medical_info,
        p.is_lost,
        u.email AS owner_email,
        u.phone AS owner_phone
      FROM pets p
      JOIN users u ON p.user_id = u.id
      WHERE p.qr_code = $1;
    `;

    const result = await pool.query(query, [qrCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró ninguna mascota asociada a este código QR.'
      });
    }

    const pet = result.rows[0];

    // Log de escaneo asíncrono en scan_logs
    pool.query(
      `INSERT INTO scan_logs (pet_id) VALUES ($1)`,
      [pet.pet_id]
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
 */
const createPet = async (req, res) => {
  const user_id = req.user.id;
  const { name, medical_info, qr_code } = req.body;

  if (!name || !qr_code) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre y el código QR son requeridos.'
    });
  }

  // Si se subió un archivo desde la galería usaremos /uploads/nombre_archivo, de lo contrario verifica si vino en body o queda null
  const photo_url = req.file ? `/uploads/${req.file.filename}` : (req.body.photo_url || null);

  try {
    const query = `
      INSERT INTO pets (user_id, name, photo_url, medical_info, qr_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [user_id, name, photo_url, medical_info, qr_code];
    const result = await pool.query(query, values);

    return res.status(201).json({
      status: 'success',
      message: 'Mascota registrada correctamente.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear mascota:', error);
    if (error.code === '23505') {
      return res.status(400).json({ status: 'error', message: 'El código QR ingresado ya está asignado a otra mascota.' });
    }
    return res.status(500).json({ status: 'error', message: 'Error al registrar la mascota.' });
  }
};

/**
 * GET /api/pets
 */
const getMyPets = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
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
 */
const updatePet = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const { name, photo_url, medical_info, is_lost } = req.body;

  try {
    const petCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [id, user_id]);
    if (petCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Mascota no encontrada o no tienes permisos para editarla.' });
    }

    const query = `
      UPDATE pets 
      SET 
        name = COALESCE($1, name),
        photo_url = COALESCE($2, photo_url),
        medical_info = COALESCE($3, medical_info),
        is_lost = COALESCE($4, is_lost)
      WHERE id = $5 AND user_id = $6
      RETURNING *;
    `;

    const values = [name, photo_url, medical_info, is_lost, id, user_id];
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