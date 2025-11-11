const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Agregar metadatos si existen
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    // Agregar stack trace si existe
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');

// Transport para logs de error
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d',
  maxSize: '20m',
  format: logFormat
});

// Transport para logs combinados
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: logFormat
});

// Transport para logs de acceso (requests HTTP)
const accessFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  maxFiles: '7d',
  maxSize: '50m',
  format: logFormat
});

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    errorFileTransport,
    combinedFileTransport,
    accessFileTransport
  ],
  // No salir en caso de error
  exitOnError: false
});

// En desarrollo, también loguear a consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Función auxiliar para loguear requests HTTP
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('user-agent')
  };
  
  logger.http('HTTP Request', logData);
};

// Función auxiliar para loguear errores con contexto
logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
};

module.exports = logger;
