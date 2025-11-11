const { body, validationResult } = require('express-validator');

const validateSaleCreation = [
  body('customer_dni')
    .trim()
    .notEmpty().withMessage('DNI del cliente es requerido')
    .isLength({ min: 7, max: 20 }).withMessage('DNI debe tener entre 7-20 caracteres'),
  
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Nombre del cliente es requerido')
    .isLength({ max: 255 }).withMessage('Nombre muy largo'),
  
  body('payment_method')
    .isIn(['cash', 'card', 'transfer', 'mercadopago'])
    .withMessage('Método de pago inválido. Opciones válidas: cash, card, transfer, mercadopago'),
  
  body('items')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto')
    .custom((items) => {
      for (const item of items) {
        if (!item.product_id || !item.quantity) {
          throw new Error('Cada item debe tener product_id y quantity');
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error('La cantidad debe ser un número mayor a 0');
        }
        if (!Number.isInteger(item.quantity)) {
          throw new Error('La cantidad debe ser un número entero');
        }
      }
      return true;
    }),
  
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = { validateSaleCreation };
