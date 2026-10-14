const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const petController = require('../controllers/petController');
const verifyToken = require('../middlewares/authMiddleware');

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

// RUTA PÚBLICA
router.get('/scan/:qrCode', petController.getPetByQrCode);

// RUTAS PROTEGIDAS
router.get('/', verifyToken, petController.getMyPets);
router.get('/:id', verifyToken, petController.getPetById);

router.post('/', verifyToken, upload.single('photo'), petController.createPet);
router.put('/:id', verifyToken, upload.single('photo'), petController.updatePet);

router.patch('/:id/status', verifyToken, petController.toggleLostStatus);
router.delete('/:id', verifyToken, petController.deletePet);

module.exports = router;