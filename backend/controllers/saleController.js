const { Sale, SaleItem, Product, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

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

      const sales = await Sale.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email']
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
      
      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['id', 'name', 'email']
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

  // Crear nueva venta
  async createSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('📝 Datos recibidos para crear venta:', req.body);
      console.log('👤 Usuario autenticado:', req.user);
      
      const {
        customer_dni,
        customer_name,
        items,
        payment_method,
        notes
      } = req.body;

      // Generar número de venta único
      const saleNumber = `V-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Calcular total de la venta
      let totalAmount = 0;
      const saleItems = [];

      // Verificar stock y calcular total
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ error: `Producto ${item.product_id} no encontrado` });
        }
        
        if (product.stock_quantity < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock_quantity}` 
          });
        }
        
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        saleItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: itemTotal
        });
      }

      // Verificar si el usuario existe en la base de datos
      const { User } = require('../models');
      let soldBy = null;
      
      if (req.user?.uid) {
        const existingUser = await User.findOne({ where: { firebase_uid: req.user.uid } });
        if (existingUser) {
          soldBy = existingUser.id;
        } else {
          console.log('⚠️ Usuario no encontrado en BD, creando usuario...');
          // Crear usuario si no existe
          const newUser = await User.create({
            firebase_uid: req.user.uid,
            email: req.user.email,
            name: req.user.email.split('@')[0],
            role: req.user.role || 'user',
            is_active: true
          }, { transaction });
          soldBy = newUser.id;
        }
      }

      // Crear la venta
      const sale = await Sale.create({
        sale_number: saleNumber,
        customer_dni,
        customer_name,
        total_amount: totalAmount,
        payment_method,
        notes,
        sold_by: soldBy
      }, { transaction });

      // Crear items de venta y actualizar stock
      for (const item of saleItems) {
        await SaleItem.create({
          ...item,
          sale_id: sale.id
        }, { transaction });

        // Actualizar stock del producto
        const product = await Product.findByPk(item.product_id);
        await product.update({
          stock_quantity: product.stock_quantity - item.quantity
        }, { transaction });
      }

      await transaction.commit();

      // Obtener la venta completa con items
      const completeSale = await Sale.findByPk(sale.id, {
        include: [
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
        ]
      });

      res.status(201).json({
        message: 'Venta registrada correctamente',
        sale: completeSale
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear venta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
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
  }
};

module.exports = saleController;
