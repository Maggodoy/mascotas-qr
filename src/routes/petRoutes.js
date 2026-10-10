const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const petController = require('../controllers/petController');
const verifyToken = require('../middlewares/authMiddleware');

// Configuración de multer para guardar fotos en la carpeta /uploads de la raíz
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --- RUTA PÚBLICA ---
router.get('/scan/:qrCode', petController.getPetByQrCode);

// --- RUTAS PROTEGIDAS ---

// Obtener todas las mascotas del usuario
router.get('/', verifyToken, petController.getMyPets);

// Obtener datos de una mascota por ID (para la pantalla de edición)
router.get('/:id', verifyToken, petController.getPetById || petController.getMyPets);

// Crear nueva mascota con foto
router.post('/', verifyToken, upload.single('photo'), petController.createPet);

// Actualizar mascota con foto (AQUÍ FALTABA upload.single('photo'))
router.put('/:id', verifyToken, upload.single('photo'), petController.updatePet);

// Alternar estado de alerta (Mascota Perdida)
if (petController.toggleLostStatus) {
  router.patch('/:id/status', verifyToken, petController.toggleLostStatus);
}

// Eliminar mascota
if (petController.deletePet) {
  router.delete('/:id', verifyToken, petController.deletePet);
}

module.exports = router;