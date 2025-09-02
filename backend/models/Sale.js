const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sale_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customer_dni: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'mercadopago'),
    defaultValue: 'cash'
  },
  status: {
    type: DataTypes.ENUM('completed', 'cancelled', 'pending'),
    defaultValue: 'completed'
  },
  notes: {
    type: DataTypes.TEXT
  },
  sold_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'sales',
  timestamps: true,
  indexes: [
    {
      fields: ['sale_number']
    },
    {
      fields: ['customer_dni']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Sale;
