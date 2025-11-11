const { Sale, SaleItem, Product, User, Customer, sequelize } = require('../../models');
const saleController = require('../../controllers/saleController');

// Mocks
let mockRequest;
let mockResponse;

beforeAll(async () => {
  // Sincronizar base de datos
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  // Limpiar datos antes de cada test
  await SaleItem.destroy({ where: {}, force: true });
  await Sale.destroy({ where: {}, force: true });
  await Product.destroy({ where: {}, force: true });
  await Customer.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });

  // Crear usuario de prueba
  const user = await User.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    firebase_uid: 'test-firebase-uid',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    is_active: true
  });

  // Crear productos de prueba
  await Product.create({
    id: 'prod-001',
    name: 'Producto Test 1',
    sku: 'TEST-001',
    price: 100.00,
    stock_quantity: 50,
    min_stock: 10,
    category: 'ENVASES',
    created_by: user.id
  });

  await Product.create({
    id: 'prod-002',
    name: 'Producto Test 2',
    sku: 'TEST-002',
    price: 200.00,
    stock_quantity: 30,
    min_stock: 5,
    category: 'DECORACIÓN',
    created_by: user.id
  });

  // Setup mocks
  mockRequest = {
    body: {},
    user: {
      uid: 'test-firebase-uid',
      email: 'test@example.com',
      role: 'admin'
    }
  };

  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
});

describe('SaleController - createSale', () => {
  test('Debe crear una venta válida y descontar stock', async () => {
    mockRequest.body = {
      customer_dni: '12345678',
      customer_name: 'Cliente Test',
      payment_method: 'cash',
      items: [
        { product_id: 'prod-001', quantity: 2 },
        { product_id: 'prod-002', quantity: 1 }
      ]
    };

    await saleController.createSale(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalled();

    const responseData = mockResponse.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.total_amount).toBe('400.00'); // 100*2 + 200*1

    // Verificar que se descontó el stock
    const product1 = await Product.findByPk('prod-001');
    const product2 = await Product.findByPk('prod-002');
    
    expect(product1.stock_quantity).toBe(48); // 50 - 2
    expect(product2.stock_quantity).toBe(29); // 30 - 1

    // Verificar que se creó el cliente
    const customer = await Customer.findOne({ where: { dni: '12345678' } });
    expect(customer).toBeDefined();
    expect(customer.name).toBe('Cliente Test');
  });

  test('Debe fallar con stock insuficiente', async () => {
    mockRequest.body = {
      customer_dni: '12345678',
      customer_name: 'Cliente Test',
      payment_method: 'cash',
      items: [
        { product_id: 'prod-001', quantity: 100 } // Más del stock disponible (50)
      ]
    };

    await saleController.createSale(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    
    const responseData = mockResponse.json.mock.calls[0][0];
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Stock insuficiente');

    // Verificar que NO se modificó el stock (rollback)
    const product = await Product.findByPk('prod-001');
    expect(product.stock_quantity).toBe(50); // Sin cambios

    // Verificar que NO se creó la venta
    const sales = await Sale.findAll();
    expect(sales.length).toBe(0);
  });

  test('Debe fallar con producto inexistente', async () => {
    mockRequest.body = {
      customer_dni: '12345678',
      customer_name: 'Cliente Test',
      payment_method: 'cash',
      items: [
        { product_id: 'prod-999', quantity: 1 } // Producto que no existe
      ]
    };

    await saleController.createSale(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    
    const responseData = mockResponse.json.mock.calls[0][0];
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('no encontrado');
  });

  test('Debe crear cliente si no existe', async () => {
    mockRequest.body = {
      customer_dni: '87654321',
      customer_name: 'Cliente Nuevo',
      payment_method: 'card',
      items: [
        { product_id: 'prod-001', quantity: 1 }
      ]
    };

    await saleController.createSale(mockRequest, mockResponse);

    const customer = await Customer.findOne({ where: { dni: '87654321' } });
    expect(customer).toBeDefined();
    expect(customer.name).toBe('Cliente Nuevo');
  });

  test('Debe usar cliente existente si ya existe el DNI', async () => {
    // Crear cliente previamente
    await Customer.create({
      dni: '99999999',
      name: 'Cliente Existente',
      email: 'existente@test.com'
    });

    mockRequest.body = {
      customer_dni: '99999999',
      customer_name: 'Otro Nombre', // Este nombre no se usará
      payment_method: 'transfer',
      items: [
        { product_id: 'prod-001', quantity: 1 }
      ]
    };

    await saleController.createSale(mockRequest, mockResponse);

    const customers = await Customer.findAll({ where: { dni: '99999999' } });
    expect(customers.length).toBe(1); // Solo debe haber un cliente con ese DNI
    expect(customers[0].name).toBe('Cliente Existente'); // Mantiene el nombre original
  });

  test('Debe generar número de venta único e incremental', async () => {
    // Crear primera venta
    mockRequest.body = {
      customer_dni: '11111111',
      customer_name: 'Cliente 1',
      payment_method: 'cash',
      items: [{ product_id: 'prod-001', quantity: 1 }]
    };
    await saleController.createSale(mockRequest, mockResponse);

    // Crear segunda venta
    mockRequest.body = {
      customer_dni: '22222222',
      customer_name: 'Cliente 2',
      payment_method: 'cash',
      items: [{ product_id: 'prod-002', quantity: 1 }]
    };
    await saleController.createSale(mockRequest, mockResponse);

    const sales = await Sale.findAll({ order: [['createdAt', 'ASC']] });
    expect(sales.length).toBe(2);
    expect(sales[0].sale_number).toBe('V-000001');
    expect(sales[1].sale_number).toBe('V-000002');
  });
});

describe('SaleController - getAllSales', () => {
  test('Debe obtener todas las ventas con relaciones', async () => {
    // Crear venta de prueba
    const user = await User.findOne();
    const customer = await Customer.create({
      dni: '12345678',
      name: 'Cliente Test'
    });

    await Sale.create({
      sale_number: 'V-000001',
      customer_id: customer.id,
      total_amount: 100,
      payment_method: 'cash',
      status: 'completed',
      sold_by: user.id
    });

    mockRequest.query = {};
    await saleController.getAllSales(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalled();
    const responseData = mockResponse.json.mock.calls[0][0];
    
    expect(responseData.sales).toBeDefined();
    expect(responseData.sales.length).toBe(1);
    expect(responseData.sales[0].sale_number).toBe('V-000001');
    expect(responseData.sales[0].customer).toBeDefined();
    expect(responseData.sales[0].seller).toBeDefined();
  });
});
