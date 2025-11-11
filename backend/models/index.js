const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Customer = require('./Customer');

// Definir relaciones
User.hasMany(Product, { foreignKey: 'created_by', as: 'products' });
Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Sale, { foreignKey: 'sold_by', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'sold_by', as: 'seller' });

// Relaciones Customer - Sale
Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'saleItems' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  Product,
  Sale,
  SaleItem,
  Customer
};
