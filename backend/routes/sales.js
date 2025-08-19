const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para usuarios autenticados
router.get('/', saleController.getAllSales);
router.get('/stats', requireRole(['admin']), saleController.getSalesStats);
router.get('/:id', saleController.getSaleById);
router.post('/', requireRole(['admin', 'user']), saleController.createSale);
router.get('/:id/receipt', saleController.generateReceipt);

module.exports = router;
