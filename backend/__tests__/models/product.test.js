const { Product, User, sequelize } = require('../../models');

beforeAll(async () => {
  // Sincronizar base de datos para testing
  await sequelize.sync({ force: true });
  
  // Crear usuario de prueba
  await User.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    firebase_uid: 'test-firebase-uid',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    is_active: true
  });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  // Limpiar productos después de cada test
  await Product.destroy({ where: {}, force: true });
});

describe('Product Model', () => {
  test('Debe crear un producto válido', async () => {
    const product = await Product.create({
      name: 'Producto Test',
      sku: 'TEST-001',
      price: 100.50,
      stock_quantity: 10,
      min_stock: 5,
      category: 'ENVASES',
      brand: 'Marca Test',
      created_by: '123e4567-e89b-12d3-a456-426614174000'
    });

    expect(product.name).toBe('Producto Test');
    expect(product.sku).toBe('TEST-001');
    expect(product.price).toBe('100.50');
    expect(product.stock_quantity).toBe(10);
    expect(product.is_active).toBe(true);
    expect(product.id).toBeDefined();
  });

  test('Debe fallar sin campos requeridos', async () => {
    await expect(
      Product.create({
        name: 'Producto Sin SKU',
        price: 100
      })
    ).rejects.toThrow();
  });

  test('Debe fallar con precio negativo', async () => {
    await expect(
      Product.create({
        name: 'Producto Inválido',
        sku: 'TEST-002',
        price: -10,
        stock_quantity: 5,
        category: 'ENVASES',
        created_by: '123e4567-e89b-12d3-a456-426614174000'
      })
    ).rejects.toThrow();
  });

  test('Debe fallar con stock negativo', async () => {
    await expect(
      Product.create({
        name: 'Producto Inválido',
        sku: 'TEST-003',
        price: 100,
        stock_quantity: -5,
        category: 'ENVASES',
        created_by: '123e4567-e89b-12d3-a456-426614174000'
      })
    ).rejects.toThrow();
  });

  test('Debe fallar con categoría inválida', async () => {
    await expect(
      Product.create({
        name: 'Producto Categoría Inválida',
        sku: 'TEST-004',
        price: 100,
        stock_quantity: 10,
        category: 'CATEGORIA_INEXISTENTE',
        created_by: '123e4567-e89b-12d3-a456-426614174000'
      })
    ).rejects.toThrow();
  });

  test('Debe fallar con SKU duplicado', async () => {
    await Product.create({
      name: 'Producto 1',
      sku: 'DUP-001',
      price: 100,
      stock_quantity: 10,
      category: 'ENVASES',
      created_by: '123e4567-e89b-12d3-a456-426614174000'
    });

    await expect(
      Product.create({
        name: 'Producto 2',
        sku: 'DUP-001', // SKU duplicado
        price: 200,
        stock_quantity: 5,
        category: 'DECORACIÓN',
        created_by: '123e4567-e89b-12d3-a456-426614174000'
      })
    ).rejects.toThrow();
  });

  test('Debe crear producto con valores por defecto', async () => {
    const product = await Product.create({
      name: 'Producto Mínimo',
      sku: 'MIN-001',
      price: 50,
      stock_quantity: 10,
      category: 'SAHUMERIOS',
      created_by: '123e4567-e89b-12d3-a456-426614174000'
    });

    expect(product.min_stock).toBe(0);
    expect(product.is_active).toBe(true);
    expect(product.brand).toBeNull();
    expect(product.description).toBeNull();
  });
});
