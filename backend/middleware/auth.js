const { verifyFirebaseToken } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Verificando autenticación...');
    console.log('🔐 Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No se encontró token');
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    console.log('🔐 Token encontrado, verificando...');
    // Verificar token de Firebase
    const decodedToken = await verifyFirebaseToken(token);
    console.log('✅ Token verificado:', decodedToken.uid);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };

    console.log('👤 Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware opcional para autenticación (permite acceso sin token)
const optionalAuth = async (req, res, next) => {
  try {
    console.log('🔐 Verificando autenticación opcional...');
    console.log('🔐 Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('⚠️ No se encontró token, continuando sin autenticación');
      req.user = null;
      next();
      return;
    }

    console.log('🔐 Token encontrado, verificando...');
    // Verificar token de Firebase
    const decodedToken = await verifyFirebaseToken(token);
    console.log('✅ Token verificado:', decodedToken.uid);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };

    console.log('👤 Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('❌ Error en autenticación opcional:', error);
    console.log('⚠️ Continuando sin autenticación debido a error');
    req.user = null;
    next();
  }
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }

  next();
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireRole
};
