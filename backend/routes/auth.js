const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Verificar token de Firebase
router.post('/verify', authController.verifyToken);

// Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, authController.getProfile);

// Actualizar perfil del usuario (requiere autenticación)
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
