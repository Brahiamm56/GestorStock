const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar logger personalizado
const logger = require('./config/logger');

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./routes/dashboard');
const customerRoutes = require('./routes/customers');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

// Middleware
app.use(helmet());
app.use(compression());

// Usar Morgan con Winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

app.use(limiter);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de todas las requests para debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`${req.method} ${req.url}`, {
      headers: req.headers,
      body: Object.keys(req.body).length > 0 ? req.body : undefined
    });
  }
  next();
});

// Servir archivos estáticos (imágenes) con CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Sincronizar base de datos
    await sequelize.authenticate();
    logger.info('✅ Conexión a la base de datos establecida correctamente');
    
    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      logger.info('✅ Modelos sincronizados con la base de datos');
    }

    const server = app.listen(PORT, () => {
      console.log('═══════════════════════════════════════');
      console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
      console.log('═══════════════════════════════════════');
      console.log(`📍 URL Local:    http://localhost:${PORT}`);
      console.log(`🔧 Entorno:      ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de Datos: SQLite`);
      console.log(`🔗 API:          http://localhost:${PORT}/api`);
      console.log('═══════════════════════════════════════');
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API disponible en: http://localhost:${PORT}/api`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`
╔════════════════════════════════════════════════════════╗
║  ❌ ERROR: PUERTO ${PORT} YA ESTÁ EN USO                    ║
╚════════════════════════════════════════════════════════╝

SOLUCIONES:

1. Matar el proceso que usa el puerto:
   fuser -k ${PORT}/tcp

2. Cambiar el puerto en el archivo .env:
   PORT=3001

3. Encontrar y matar el proceso manualmente:
   lsof -ti:${PORT} | xargs kill -9
        `);
        logger.error(`❌ ERROR: El puerto ${PORT} ya está en uso`);
        process.exit(1);
      } else {
        logger.error('❌ Error del servidor:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Error al iniciar el servidor', { error: error.message, stack: error.stack });
    console.error(`
╔════════════════════════════════════════════════════════╗
║  ❌ ERROR FATAL AL INICIAR SERVIDOR                    ║
╚════════════════════════════════════════════════════════╝
`);
    console.error(error);
    process.exit(1);
  }
}

startServer();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.warn('SIGTERM recibido, cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.warn('SIGINT recibido, cerrando servidor gracefully...');
  process.exit(0);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada', { reason, promise });
});
