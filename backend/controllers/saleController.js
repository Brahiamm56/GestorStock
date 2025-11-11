const { Sale, SaleItem, Product, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const pdfService = require('../services/pdfService');

const saleController = {
  // Obtener todas las ventas
  async getAllSales(req, res) {
    try {
      const { page = 1, limit = 10, startDate, endDate, status } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};
      
      // Filtros de fecha
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }
      
      // Filtro por estado
      if (status) {
        whereClause.status = status;
      }

      const { Customer } = require('../models');
      const sales = await Sale.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'dni', 'name', 'email', 'phone']
          },
          {
            model: SaleItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        sales: sales.rows,
        total: sales.count,
        totalPages: Math.ceil(sales.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener venta por ID
  async getSaleById(req, res) {
    try {
      const { id } = req.params;
      
      const { Customer } = require('../models');
      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'dni', 'name', 'email', 'phone', 'address']
          },
          {
            model: SaleItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku', 'price']
              }
            ]
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      res.json({ sale });
    } catch (error) {
      console.error('Error al obtener venta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nueva venta con transacciones y validaciones robustas
  async createSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('📝 Iniciando creación de venta:', req.body);
      console.log('👤 Usuario autenticado:', req.user);
      
      const {
        customer_dni,
        customer_name,
        items,
        payment_method,
        notes
      } = req.body;

      // PASO 1: VALIDAR STOCK DISPONIBLE ANTES DE TODO
      console.log('🔍 Validando stock de productos...');
      for (const item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        
        if (!product) {
          throw new Error(`Producto con ID ${item.product_id} no encontrado`);
        }
        
        if (!product.is_active) {
          throw new Error(`El producto "${product.name}" está inactivo y no puede venderse`);
        }
        
        if (product.stock_quantity < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.name}". ` +
            `Disponible: ${product.stock_quantity}, Solicitado: ${item.quantity}`
          );
        }
      }
      console.log('✅ Validación de stock completada');

      // PASO 2: CALCULAR TOTAL Y PREPARAR ITEMS
      console.log('💰 Calculando total de la venta...');
      let totalAmount = 0;
      const itemsWithPrices = [];
      
      for (const item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        
        itemsWithPrices.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: subtotal  // ← Cambiado de subtotal a total_price
        });
      }
      console.log(`✅ Total calculado: $${totalAmount}`);

      // PASO 3: GENERAR NÚMERO DE VENTA ÚNICO
      const lastSale = await Sale.findOne({
        order: [['createdAt', 'DESC']],
        transaction
      });
      
      const saleNumber = lastSale 
        ? `V-${String(parseInt(lastSale.sale_number.split('-')[1]) + 1).padStart(6, '0')}` 
        : 'V-000001';
      
      console.log(`📄 Número de venta generado: ${saleNumber}`);

      // PASO 4: OBTENER O CREAR USUARIO VENDEDOR
      const { User } = require('../models');
      let soldBy = null;
      
      if (req.user?.uid) {
        let existingUser = await User.findOne({ 
          where: { firebase_uid: req.user.uid },
          transaction 
        });
        
        if (existingUser) {
          soldBy = existingUser.id;
        } else {
          console.log('⚠️ Usuario no encontrado en BD, creando...');
          const newUser = await User.create({
            firebase_uid: req.user.uid,
            email: req.user.email || 'unknown@email.com',
            name: req.user.email ? req.user.email.split('@')[0] : 'Usuario',
            role: req.user.role || 'user',
            is_active: true
          }, { transaction });
          soldBy = newUser.id;
          console.log(`✅ Usuario creado: ${newUser.email}`);
        }
      }

      if (!soldBy) {
        throw new Error('No se pudo identificar al usuario vendedor');
      }

      // PASO 5: BUSCAR O CREAR CLIENTE
      console.log('👤 Buscando o creando cliente...');
      const { Customer } = require('../models');
      const [customer] = await Customer.findOrCreate({
        where: { dni: customer_dni },
        defaults: { 
          name: customer_name,
          customer_type: 'individual'
        },
        transaction
      });
      console.log(`✅ Cliente: ${customer.name} (ID: ${customer.id})`);

      // PASO 6: CREAR VENTA
      console.log('💾 Creando registro de venta...');
      const sale = await Sale.create({
        sale_number: saleNumber,
        customer_id: customer.id,         // ← NUEVO: Relación con Customer
        customer_dni,                      // Mantener por compatibilidad
        customer_name,                     // Mantener por compatibilidad
        total_amount: totalAmount,
        payment_method,
        status: 'completed',
        notes,
        sold_by: soldBy
      }, { transaction });
      console.log(`✅ Venta creada: ID ${sale.id}`);

      // PASO 7: CREAR ITEMS Y DESCONTAR STOCK
      console.log('📦 Procesando items y actualizando stock...');
      for (const item of itemsWithPrices) {
        // Crear item de venta
        await SaleItem.create({
          sale_id: sale.id,
          ...item
        }, { transaction });

        // Descontar stock del producto
        const product = await Product.findByPk(item.product_id, { transaction });
        const newStock = product.stock_quantity - item.quantity;
        
        await product.update({
          stock_quantity: newStock
        }, { transaction });
        
        console.log(`  ✓ ${product.name}: ${product.stock_quantity} → ${newStock}`);
      }

      // PASO 8: COMMIT DE LA TRANSACCIÓN
      await transaction.commit();
      console.log('✅ Transacción completada exitosamente');

      // PASO 9: RETORNAR VENTA COMPLETA CON RELACIONES
      const completeSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [
              { 
                model: Product, 
                as: 'product',
                attributes: ['id', 'name', 'sku', 'price']
              }
            ]
          },
          { 
            model: User, 
            as: 'seller', 
            attributes: ['id', 'name', 'email'] 
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Venta creada exitosamente',
        data: completeSale
      });
      
    } catch (error) {
      // ROLLBACK en caso de cualquier error
      await transaction.rollback();
      console.error('❌ Error creando venta:', error);
      
      res.status(400).json({
        success: false,
        error: error.message || 'Error al crear la venta',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Generar comprobante PDF
  async generateReceipt(req, res) {
    try {
      const { id } = req.params;
      
      console.log('🔍 Generando comprobante para venta:', id);
      
      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['name']
          },
          {
            model: SaleItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'sku']
              }
            ]
          }
        ]
      });

      if (!sale) {
        console.log('❌ Venta no encontrada:', id);
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      console.log('✅ Venta encontrada:', sale.sale_number);
      console.log('📦 Items:', sale.items?.length || 0);

      // Crear documento PDF en memoria
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];

      // Capturar chunks del PDF
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Configurar el documento
      doc.fontSize(20).text('COMPROBANTE DE VENTA', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Número de Venta: ${sale.sale_number}`);
      doc.text(`Fecha: ${sale.created_at.toLocaleDateString('es-ES')}`);
      doc.text(`Cliente: ${sale.customer_name || 'N/A'}`);
      doc.text(`DNI: ${sale.customer_dni || 'N/A'}`);
      doc.text(`Vendedor: ${sale.seller?.name || 'N/A'}`);
      doc.moveDown();

      // Tabla de productos
      doc.fontSize(14).text('PRODUCTOS:', { underline: true });
      doc.moveDown();
      
      doc.fontSize(10);
      doc.text('Producto', 50, doc.y, { width: 200 });
      doc.text('Cantidad', 250, doc.y - 15, { width: 80 });
      doc.text('Precio Unit.', 330, doc.y - 15, { width: 80 });
      doc.text('Total', 410, doc.y - 15, { width: 80 });
      doc.moveDown();

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(490, doc.y).stroke();
      doc.moveDown();

      // Items de la venta
      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          doc.text(item.product?.name || 'Producto no encontrado', 50, doc.y, { width: 200 });
          doc.text(item.quantity.toString(), 250, doc.y - 15, { width: 80 });
          doc.text(`$${(item.unit_price || 0).toFixed(2)}`, 330, doc.y - 15, { width: 80 });
          doc.text(`$${(item.total_price || 0).toFixed(2)}`, 410, doc.y - 15, { width: 80 });
          doc.moveDown();
        }
      } else {
        doc.text('No hay productos en esta venta', 50, doc.y, { width: 400 });
        doc.moveDown();
      }

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(490, doc.y).stroke();
      doc.moveDown();

      // Total
      doc.fontSize(14).text(`TOTAL: $${(sale.total_amount || 0).toFixed(2)}`, { align: 'right' });
      doc.moveDown();

      // Método de pago
      if (sale.payment_method) {
        doc.fontSize(12).text(`Método de Pago: ${sale.payment_method.toUpperCase()}`);
      }
      
      if (sale.notes) {
        doc.moveDown();
        doc.text(`Notas: ${sale.notes}`);
      }

      // Finalizar documento
      doc.end();

      // Esperar a que se complete la generación
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('✅ PDF generado, tamaño:', pdfBuffer.length, 'bytes');
          
          // Configurar headers para descarga
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="comprobante-${sale.sale_number}.pdf"`);
          res.setHeader('Content-Length', pdfBuffer.length);
          
          // Enviar el PDF como buffer
          res.send(pdfBuffer);
        } catch (sendError) {
          console.error('❌ Error al enviar PDF:', sendError);
          res.status(500).json({ error: 'Error al enviar PDF' });
        }
      });

      // Manejar errores del documento
      doc.on('error', (error) => {
        console.error('❌ Error en generación de PDF:', error);
        res.status(500).json({ error: 'Error al generar PDF' });
      });

    } catch (error) {
      console.error('❌ Error al generar comprobante:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener estadísticas de ventas
  async getSalesStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }

      const totalSales = await Sale.count({ where: whereClause });
      const totalRevenue = await Sale.sum('total_amount', { where: whereClause });
      const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Ventas por método de pago
      const salesByPayment = await Sale.findAll({
        where: whereClause,
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
        ],
        group: ['payment_method']
      });

      res.json({
        totalSales,
        totalRevenue: totalRevenue || 0,
        avgSaleValue,
        salesByPayment
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Genera y descarga el comprobante PDF de una venta
   */
  async generateReceipt(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 [PDF] Generando comprobante para sale ID: ${id}`);

      // Buscar la venta con todas las relaciones necesarias
      const { Customer } = require('../models');
      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku', 'price']
              }
            ]
          },
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'phone', 'dni'],
            required: false
          }
        ]
      });

      console.log(`📊 [PDF] Venta encontrada: ${sale ? 'SÍ' : 'NO'}`);

      if (!sale) {
        console.error('❌ [PDF] Venta no encontrada');
        return res.status(404).json({
          success: false,
          error: 'Venta no encontrada'
        });
      }

      console.log(`📝 [PDF] Items en venta: ${sale.items?.length || 0}`);
      console.log(`👤 [PDF] Vendedor: ${sale.seller ? sale.seller.name || sale.seller.email : 'N/A'}`);
      console.log(`🧑 [PDF] Customer: ${sale.customer ? sale.customer.name : 'N/A'}`);
      console.log('🔧 [PDF] Generando PDF...');

      // Debug: mostrar estructura de la venta
      console.log('[PDF] Estructura de venta:', JSON.stringify({
        id: sale.id,
        sale_number: sale.sale_number,
        items_count: sale.items?.length || 0,
        has_seller: !!sale.seller,
        has_customer: !!sale.customer
      }, null, 2));

      // Generar el PDF
      const pdfBuffer = await pdfService.generateSaleReceipt(sale);

      console.log(`✅ [PDF] PDF generado exitosamente, tamaño: ${pdfBuffer.length} bytes`);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=comprobante-${sale.sale_number || sale.id}.pdf`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar el PDF
      res.send(pdfBuffer);

    } catch (error) {
      console.error(`❌ [PDF] ERROR: ${error.message}`);
      console.error(`📚 [PDF] Stack:`, error.stack);
      res.status(500).json({
        success: false,
        error: 'Error al generar el comprobante PDF',
        details: error.message
      });
    }
  }
};

module.exports = saleController;
