const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const verifyToken = require('../middlewares/authMiddleware');

// --- RUTA PÚBLICA ---
// Lectura de QR al escanear el collar
router.get('/scan/:qrCode', petController.getPetByQrCode);

// --- RUTAS PROTEGIDAS (Requieren Token JWT) ---
router.use(verifyToken);

router.post('/', petController.createPet);        // Crear nueva mascota
router.get('/', petController.getMyPets);          // Listar mis mascotas
router.put('/:id', petController.updatePet);      // Editar datos de mi mascota

module.exports = router;