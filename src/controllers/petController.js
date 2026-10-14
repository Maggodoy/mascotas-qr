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
        p.birth_date,
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
 * GET /api/pets/:id
 */
const getPetById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM pets WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mascota no encontrada.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener mascota por ID:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la información de la mascota.'
    });
  }
};

/**
 * POST /api/pets
 */
const createPet = async (req, res) => {
  const user_id = req.user.id;
  const { name, medical_info, qr_code, birth_date } = req.body;

  if (!name || !qr_code) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre y el código QR son requeridos.'
    });
  }

  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  const photo_url = file ? `/uploads/${file.filename}` : null;

  const formattedBirthDate = (birth_date && String(birth_date).trim() !== '' && birth_date !== 'undefined') 
    ? birth_date 
    : null;
    
  const cleanedMedicalInfo = (medical_info && String(medical_info).trim() !== '') 
    ? medical_info.trim() 
    : null;

  try {
    const query = `
      INSERT INTO pets (user_id, name, photo_url, medical_info, qr_code, birth_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      user_id, 
      name.trim(), 
      photo_url, 
      cleanedMedicalInfo, 
      qr_code.trim(), 
      formattedBirthDate
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      status: 'success',
      message: 'Mascota registrada correctamente.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear mascota:', error);

    if (error.code === '23505') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El código QR ingresado ya está asignado a otra mascota.' 
      });
    }

    return res.status(500).json({ 
      status: 'error', 
      message: 'Error al registrar la mascota.' 
    });
  }
};

/**
 * GET /api/pets
 */
const getMyPets = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC', 
      [user_id]
    );
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
  const { name, medical_info, is_lost, birth_date } = req.body;

  try {
    const petCheck = await pool.query('SELECT * FROM pets WHERE id = $1 AND user_id = $2', [id, user_id]);
    if (petCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Mascota no encontrada.' });
    }

    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    const photo_url = file ? `/uploads/${file.filename}` : petCheck.rows[0].photo_url;
    const parsedIsLost = is_lost !== undefined ? (is_lost === 'true' || is_lost === true) : petCheck.rows[0].is_lost;
    const formattedBirthDate = (birth_date && String(birth_date).trim() !== '' && birth_date !== 'undefined') ? birth_date : petCheck.rows[0].birth_date;
    const cleanedMedicalInfo = (medical_info !== undefined && String(medical_info).trim() !== '') ? medical_info.trim() : petCheck.rows[0].medical_info;

    const query = `
      UPDATE pets 
      SET 
        name = COALESCE($1, name),
        photo_url = $2,
        medical_info = $3,
        is_lost = $4,
        birth_date = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *;
    `;

    const values = [
      name ? name.trim() : null, 
      photo_url, 
      cleanedMedicalInfo, 
      parsedIsLost, 
      formattedBirthDate, 
      id, 
      user_id
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      status: 'success',
      message: 'Mascota actualizada correctamente.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    return res.status(500).json({ status: 'error', message: 'Error al actualizar la mascota.' });
  }
};

/**
 * PATCH /api/pets/:id/status
 */
const toggleLostStatus = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const { is_lost } = req.body;

  try {
    const result = await pool.query(
      'UPDATE pets SET is_lost = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [is_lost, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Mascota no encontrada.' });
    }

    return res.status(200).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error al cambiar estado de alerta:', error);
    return res.status(500).json({ status: 'error', message: 'Error al cambiar estado de alerta.' });
  }
};

/**
 * DELETE /api/pets/:id
 */
const deletePet = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Mascota no encontrada.' });
    }

    return res.status(200).json({ status: 'success', message: 'Mascota eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    return res.status(500).json({ status: 'error', message: 'Error al eliminar la mascota.' });
  }
};

module.exports = {
  getPetByQrCode,
  getPetById,
  createPet,
  getMyPets,
  updatePet,
  toggleLostStatus,
  deletePet
};