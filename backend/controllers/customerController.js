const { Customer, Sale, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class CustomerController {
  // Obtener todos los clientes
  async getAllCustomers(req, res) {
    try {
      const { search, is_active, page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = req.query;
      
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { dni: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Customer.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]]
      });
      
      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener clientes',
        details: error.message 
      });
    }
  }

  // Obtener cliente por ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      
      const customer = await Customer.findByPk(id);
      
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      }
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener cliente',
        details: error.message 
      });
    }
  }

  // Buscar o crear cliente
  async findOrCreateCustomer(req, res) {
    try {
      const { dni, name, email, phone, address, customer_type, tax_id } = req.body;
      
      if (!dni || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'DNI y nombre son requeridos' 
        });
      }
      
      const [customer, created] = await Customer.findOrCreate({
        where: { dni },
        defaults: { 
          name, 
          email, 
          phone, 
          address, 
          customer_type: customer_type || 'individual', 
          tax_id 
        }
      });
      
      res.status(created ? 201 : 200).json({
        success: true,
        message: created ? 'Cliente creado exitosamente' : 'Cliente encontrado',
        data: customer,
        created
      });
    } catch (error) {
      console.error('Error buscando/creando cliente:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al buscar/crear cliente',
        details: error.message 
      });
    }
  }

  // Crear cliente
  async createCustomer(req, res) {
    try {
      const { dni, name, email, phone, address, customer_type, tax_id, notes } = req.body;
      
      // Validar campos requeridos
      if (!dni || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'DNI y nombre son requeridos' 
        });
      }
      
      // Verificar si el DNI ya existe
      const existing = await Customer.findOne({ where: { dni } });
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          error: 'Ya existe un cliente con ese DNI' 
        });
      }
      
      const customer = await Customer.create({
        dni,
        name,
        email,
        phone,
        address,
        customer_type: customer_type || 'individual',
        tax_id,
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: customer
      });
    } catch (error) {
      console.error('Error creando cliente:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al crear cliente',
        details: error.message 
      });
    }
  }

  // Actualizar cliente
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      }
      
      // Si se está actualizando el DNI, verificar que no exista otro cliente con ese DNI
      if (updateData.dni && updateData.dni !== customer.dni) {
        const existing = await Customer.findOne({ where: { dni: updateData.dni } });
        if (existing) {
          return res.status(409).json({ 
            success: false, 
            error: 'Ya existe un cliente con ese DNI' 
          });
        }
      }
      
      await customer.update(updateData);
      
      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: customer
      });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al actualizar cliente',
        details: error.message 
      });
    }
  }

  // Eliminar cliente (soft delete)
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      }
      
      // Soft delete
      await customer.update({ is_active: false });
      
      res.json({
        success: true,
        message: 'Cliente desactivado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al eliminar cliente',
        details: error.message 
      });
    }
  }

  // Obtener historial de compras del cliente
  async getCustomerSales(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, status } = req.query;
      
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      }
      
      const whereClause = { customer_id: id };
      
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      const sales = await Sale.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [
          { model: User, as: 'seller', attributes: ['name', 'email'] }
        ]
      });
      
      const totalSpent = await Sale.sum('total_amount', {
        where: { customer_id: id, status: 'completed' }
      });
      
      const totalSales = await Sale.count({
        where: { customer_id: id, status: 'completed' }
      });
      
      res.json({
        success: true,
        data: {
          customer,
          sales,
          statistics: {
            totalSales,
            totalSpent: totalSpent || 0,
            averageTicket: totalSales > 0 ? (totalSpent / totalSales).toFixed(2) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener historial de compras',
        details: error.message 
      });
    }
  }

  // Obtener estadísticas generales de clientes
  async getCustomerStats(req, res) {
    try {
      const totalCustomers = await Customer.count({ where: { is_active: true } });
      const totalInactive = await Customer.count({ where: { is_active: false } });
      
      const customersWithSales = await sequelize.query(
        `SELECT COUNT(DISTINCT customer_id) as count FROM sales WHERE customer_id IS NOT NULL`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      res.json({
        success: true,
        data: {
          totalCustomers,
          totalInactive,
          customersWithPurchases: customersWithSales[0]?.count || 0
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener estadísticas',
        details: error.message 
      });
    }
  }
}

module.exports = new CustomerController();
