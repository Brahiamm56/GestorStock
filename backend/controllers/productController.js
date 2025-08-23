const { Product, User } = require('../models');
const { Op } = require('sequelize');

const productController = {
  // Obtener todos los productos
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, search, category, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = { is_active: true };
      
      // Filtro de búsqueda
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Filtro por categoría
      if (category) {
        whereClause.category = category;
      }

      const products = await Product.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        products: products.rows,
        total: products.count,
        totalPages: Math.ceil(products.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener producto por ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ 
        success: true,
        product 
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Crear nuevo producto
  async createProduct(req, res) {
    try {
      const {
        name,
        description,
        sku,
        price,
        stock_quantity,
        min_stock,
        category,
        brand,
        image_url
      } = req.body;

      // Validar categoría
      const validCategories = ['ENVASES', 'DECORACIÓN', 'SAHUMERIOS'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          error: 'Categoría inválida. Las categorías válidas son: ENVASES, DECORACIÓN, SAHUMERIOS' 
        });
      }

      // Verificar si el SKU ya existe
      const existingProduct = await Product.findOne({ where: { sku } });
      if (existingProduct) {
        return res.status(409).json({ error: 'El SKU ya existe' });
      }

      // Buscar el usuario en la base de datos o crear uno temporal
      let user = await User.findOne({ where: { firebase_uid: req.user.uid } });
      
      if (!user) {
        // Crear usuario temporal si no existe
        user = await User.create({
          firebase_uid: req.user.uid,
          email: req.user.email || 'temp@example.com',
          name: req.user.email ? req.user.email.split('@')[0] : 'Usuario',
          role: 'user',
          is_active: true
        });
      }

      const product = await Product.create({
        name,
        description,
        sku,
        price,
        stock_quantity,
        min_stock,
        category,
        brand,
        image_url,
        created_by: user.id
      });

      res.status(201).json({
        success: true,
        message: 'Producto creado correctamente',
        product
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Actualizar producto
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Validar categoría si se está actualizando
      if (updateData.category) {
        const validCategories = ['ENVASES', 'DECORACIÓN', 'SAHUMERIOS'];
        if (!validCategories.includes(updateData.category)) {
          return res.status(400).json({ 
            error: 'Categoría inválida. Las categorías válidas son: ENVASES, DECORACIÓN, SAHUMERIOS' 
          });
        }
      }

      // Verificar si el SKU ya existe (si se está actualizando)
      if (updateData.sku && updateData.sku !== product.sku) {
        const existingProduct = await Product.findOne({ where: { sku: updateData.sku } });
        if (existingProduct) {
          return res.status(409).json({ error: 'El SKU ya existe' });
        }
      }

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        product
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Eliminar producto (soft delete) - CON LOGS EXTENSIVOS
  async deleteProduct(req, res) {
    console.log(`=== INICIO ELIMINACIÓN PRODUCTO ===`);
    console.log(`ID recibido: ${req.params.id}`);
    console.log(`Headers:`, req.headers);
    console.log(`User:`, req.user);
    
    try {
      const { id } = req.params;

      // Buscar el producto
      const product = await Product.findByPk(id);
      console.log(`Producto encontrado:`, product ? `Sí - ${product.name}` : 'No existe');
      
      if (!product) {
        console.log(`❌ Producto ${id} no encontrado en BD`);
        return res.status(404).json({ 
          success: false,
          error: 'Producto no encontrado' 
        });
      }

      // Soft delete - marcar como inactivo
      await product.update({ is_active: false });
      console.log(`✅ Producto ${id} marcado como inactivo exitosamente`);

      res.json({ 
        success: true,
        message: 'Producto eliminado correctamente',
        deletedId: id
      });
    } catch (error) {
      console.error(`❌ ERROR CRÍTICO al eliminar producto:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
    
    console.log(`=== FIN ELIMINACIÓN PRODUCTO ===`);
  },

  // Actualizar stock de producto
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock_quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      let newStock;
      switch (operation) {
        case 'add':
          newStock = product.stock_quantity + parseInt(stock_quantity);
          break;
        case 'subtract':
          newStock = product.stock_quantity - parseInt(stock_quantity);
          if (newStock < 0) {
            return res.status(400).json({ error: 'Stock insuficiente' });
          }
          break;
        case 'set':
        default:
          newStock = parseInt(stock_quantity);
          break;
      }

      await product.update({ stock_quantity: newStock });

      res.json({
        message: 'Stock actualizado correctamente',
        product: {
          id: product.id,
          name: product.name,
          stock_quantity: newStock
        }
      });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener productos con stock bajo
  async getLowStockProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: {
          is_active: true,
          stock_quantity: {
            [Op.lte]: sequelize.col('min_stock')
          }
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['stock_quantity', 'ASC']]
      });

      res.json({ products });
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener categorías disponibles
  async getCategories(req, res) {
    try {
      const categories = ['ENVASES', 'DECORACIÓN', 'SAHUMERIOS'];
      res.json({ categories });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = productController;
