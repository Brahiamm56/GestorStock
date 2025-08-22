const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', authenticateToken, productController.getLowStockProducts);
router.get('/:id', productController.getProductById);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas para usuarios autenticados
router.post('/', requireRole(['admin', 'user']), productController.createProduct);
router.put('/:id', requireRole(['admin', 'user']), productController.updateProduct);
router.patch('/:id/stock', requireRole(['admin', 'user']), productController.updateStock);

// Rutas solo para administradores (TEMPORALMENTE SIN AUTH PARA TESTING)
router.delete('/:id', productController.deleteProduct);

module.exports = router;
