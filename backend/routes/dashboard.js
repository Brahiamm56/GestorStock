const express = require('express');
const router = express.Router();
const { Product, Sale, User } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');

// Obtener estadísticas del dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Obtener fecha de inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Obtener fecha de inicio del mes actual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Estadísticas de productos
    const totalProducts = await Product.count({
      where: { is_active: true }
    });
    
    const lowStockProducts = await Product.count({
      where: {
        is_active: true,
        stock_quantity: {
          [Op.lte]: 10
        }
      }
    });
    
    // Estadísticas de ventas
    const todaySales = await Sale.count({
      where: {
        created_at: {
          [Op.gte]: today
        }
      }
    });
    
    const monthSales = await Sale.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    // Ingresos del día
    const todayRevenue = await Sale.sum('total_amount', {
      where: {
        created_at: {
          [Op.gte]: today
        }
      }
    });
    
    // Ingresos del mes
    const monthRevenue = await Sale.sum('total_amount', {
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    // Ventas pendientes
    const pendingSales = await Sale.count({
      where: {
        status: 'pending'
      }
    });
    
    // Usuarios activos
    const activeUsers = await User.count({
      where: { is_active: true }
    });
    
    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        sales: {
          today: todaySales,
          month: monthSales,
          pending: pendingSales
        },
        revenue: {
          today: todayRevenue || 0,
          month: monthRevenue || 0
        },
        users: {
          active: activeUsers
        }
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
});

// Obtener productos con stock bajo
router.get('/low-stock-products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        is_active: true,
        stock_quantity: {
          [Op.lte]: 10
        }
      },
      order: [['stock_quantity', 'ASC']],
      limit: 10
    });
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos con stock bajo'
    });
  }
});

// Obtener ventas recientes
router.get('/recent-sales', authenticateToken, async (req, res) => {
  try {
    const sales = await Sale.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json({
      success: true,
      data: sales
    });
    
  } catch (error) {
    console.error('Error al obtener ventas recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas recientes'
    });
  }
});

module.exports = router;
