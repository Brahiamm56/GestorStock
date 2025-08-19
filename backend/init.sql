-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la base de datos si no existe (esto se maneja automáticamente por las variables de entorno)
-- La base de datos 'gestor_stock' se crea automáticamente

-- Crear usuario administrador por defecto (opcional)
-- INSERT INTO users (id, firebase_uid, email, name, role, is_active) 
-- VALUES (
--   uuid_generate_v4(),
--   'default-admin-uid',
--   'admin@gestorstock.com',
--   'Administrador',
--   'admin',
--   true
-- ) ON CONFLICT (firebase_uid) DO NOTHING;

-- Comentario: Las tablas se crearán automáticamente cuando se ejecute la aplicación
-- gracias a la sincronización de Sequelize en modo desarrollo
