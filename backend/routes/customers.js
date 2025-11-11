const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para gestión de clientes
router.get('/', customerController.getAllCustomers);
router.get('/stats', requireRole(['admin']), customerController.getCustomerStats);
router.get('/:id', customerController.getCustomerById);
router.get('/:id/sales', customerController.getCustomerSales);
router.post('/', requireRole(['admin', 'user']), customerController.createCustomer);
router.post('/find-or-create', requireRole(['admin', 'user']), customerController.findOrCreateCustomer);
router.put('/:id', requireRole(['admin', 'user']), customerController.updateCustomer);
router.delete('/:id', requireRole(['admin']), customerController.deleteCustomer);

module.exports = router;
