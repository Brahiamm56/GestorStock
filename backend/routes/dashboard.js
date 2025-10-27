const express = require('express');
const router = express.Router();
const { Product, Sale, SaleItem, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

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

// Obtener datos de overview del dashboard
router.get('/overview', optionalAuth, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calcular fechas según el período
    const now = new Date();
    let startDate, endDate, dateRange;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        dateRange = 'Últimos 7 días';
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        dateRange = 'Últimos 30 días';
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        dateRange = 'Último año';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        dateRange = 'Últimos 30 días';
    }
    
    // Obtener ingresos totales del período
    const totalRevenue = await Sale.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;
    
    // Obtener ingresos del período anterior para calcular crecimiento
    const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousRevenue = await Sale.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [previousStartDate, startDate]
        }
      }
    }) || 0;
    
    // Calcular crecimiento porcentual
    const growth = previousRevenue > 0 ? 
      ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Obtener beneficio neto (asumiendo un margen del 30%)
    const netProfit = totalRevenue * 0.3;
    
    // Obtener ingresos netos (después de impuestos, asumiendo 15% de impuestos)
    const netRevenue = totalRevenue * 0.85;
    
    res.json({
      success: true,
      overview: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        dateRange,
        growth: parseFloat(growth.toFixed(1)),
        netProfit: parseFloat(netProfit.toFixed(2)),
        netRevenue: parseFloat(netRevenue.toFixed(2))
      }
    });
    
  } catch (error) {
    console.error('Error al obtener datos de overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de overview',
      error: error.message
    });
  }
});

// Obtener datos de ventas mensuales
router.get('/monthly-sales', optionalAuth, async (req, res) => {
  try {
    console.log('📊 Obteniendo datos de ventas mensuales...');
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = [];
    
    // Obtener datos de los últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, now.getMonth() - i, 1);
      const nextMonth = new Date(currentYear, now.getMonth() - i + 1, 1);
      
      console.log(`📅 Procesando mes ${i}: ${monthDate.toISOString()} - ${nextMonth.toISOString()}`);
      
      const monthRevenue = await Sale.sum('total_amount', {
        where: {
          created_at: {
            [Op.between]: [monthDate, nextMonth]
          }
        }
      }) || 0;
      
      console.log(`💰 Ingresos del mes ${i}: ${monthRevenue}`);
      
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      monthlyData.push({
        month: monthNames[monthDate.getMonth()],
        revenue: parseFloat(monthRevenue.toFixed(2))
      });
    }
    
    console.log('📊 Datos mensuales finales:', monthlyData);
    console.log('📊 Total de meses con datos:', monthlyData.filter(m => m.revenue > 0).length);
    
    res.json({
      success: true,
      monthlyData
    });
    
  } catch (error) {
    console.error('Error al obtener datos mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos mensuales',
      error: error.message
    });
  }
});

// Obtener estadísticas de métodos de pago
router.get('/payment-methods', optionalAuth, async (req, res) => {
  try {
    console.log('💳 Obteniendo estadísticas de métodos de pago...');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Obtener estadísticas de ventas por método de pago
    const cashSales = await Sale.count({
      where: {
        payment_method: 'cash',
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    const cardSales = await Sale.count({
      where: {
        payment_method: 'card',
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    const transferSales = await Sale.count({
      where: {
        payment_method: 'transfer',
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    const mercadopagoSales = await Sale.count({
      where: {
        payment_method: 'mercadopago',
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    const totalSales = cashSales + cardSales + transferSales + mercadopagoSales;
    
    // Calcular porcentajes
    const cashPercentage = totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0;
    const cardPercentage = totalSales > 0 ? Math.round((cardSales / totalSales) * 100) : 0;
    const transferPercentage = totalSales > 0 ? Math.round((transferSales / totalSales) * 100) : 0;
    const mercadopagoPercentage = totalSales > 0 ? Math.round((mercadopagoSales / totalSales) * 100) : 0;
    
    console.log('💳 Métodos de pago:', {
      cash: cashSales,
      card: cardSales,
      transfer: transferSales,
      mercadopago: mercadopagoSales,
      total: totalSales
    });
    
    res.json({
      success: true,
      paymentMethods: {
        cash: {
          count: cashSales,
          percentage: cashPercentage
        },
        card: {
          count: cardSales,
          percentage: cardPercentage
        },
        transfer: {
          count: transferSales,
          percentage: transferPercentage
        },
        mercadopago: {
          count: mercadopagoSales,
          percentage: mercadopagoPercentage
        }
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas de métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de métodos de pago',
      error: error.message
    });
  }
});

// Obtener actividades recientes
router.get('/activities', optionalAuth, async (req, res) => {
  try {
    const recentSales = await Sale.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name']
        }
      ]
    });
    
    const activities = recentSales.map((sale, index) => {
      const timeAgo = new Date() - sale.created_at;
      const hours = Math.floor(timeAgo / (1000 * 60 * 60));
      const minutes = Math.floor((timeAgo % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeText, dateText;
      if (hours < 1) {
        timeText = `${minutes} min`;
        dateText = 'Ahora';
      } else if (hours < 24) {
        timeText = `${hours}h`;
        dateText = 'Hoy';
      } else {
        const days = Math.floor(hours / 24);
        timeText = `${days}d`;
        dateText = days === 1 ? 'Ayer' : `${days} días`;
      }
      
      return {
        id: sale.id,
        user: sale.seller?.name || 'Usuario',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(sale.seller?.name || 'U')}&background=8b5cf6&color=fff`,
        description: `Venta completada por $${parseFloat(sale.total_amount).toFixed(2)}`,
        status: sale.status === 'completed' ? 'completed' : 'processing',
        statusText: sale.status === 'completed' ? 'Completada' : 'En Proceso',
        time: timeText,
        date: dateText
      };
    });
    
    res.json({
      success: true,
      activities
    });
    
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
});

// Obtener productos más vendidos (MEJORADO - datos reales)
router.get('/best-products', optionalAuth, async (req, res) => {
  try {
    // Obtener productos más vendidos basado en cantidad total vendida
    const bestProducts = await SaleItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url'],
          where: {
            is_active: true
          }
        }
      ],
      group: ['product_id', 'Product.id'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: 3
    });
    
    const formattedProducts = bestProducts.map((item, index) => {
      const badges = ['Best Seller', 'New', 'Hot'];
      const totalSold = parseInt(item.dataValues.totalSold || 0);
      const totalRevenue = parseFloat(item.dataValues.totalRevenue || 0);
      
      return {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image_url || 'https://via.placeholder.com/150',
        price: parseFloat(item.product.price),
        originalPrice: item.product.price * 1.1, // Precio original 10% más alto
        badge: index < badges.length ? badges[index] : null,
        totalSold: totalSold,
        totalRevenue: totalRevenue
      };
    });
    
    res.json({
      success: true,
      bestProducts: formattedProducts
    });
    
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos más vendidos',
      error: error.message
    });
  }
});

module.exports = router;
