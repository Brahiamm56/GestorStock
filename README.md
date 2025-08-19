# Gestor de Stock

Sistema completo de gestión de inventario desarrollado con Vue.js, Node.js y PostgreSQL.

## 🚀 Tecnologías

- **Frontend**: Vue.js 3 con Vue Router y Pinia
- **Backend**: Node.js con Express
- **Base de datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: Firebase Auth
- **Hosting**: Preparado para Azure/Hostinger

## 📁 Estructura del Proyecto

```
GestorStock/
├── frontend/          # Aplicación Vue.js
├── backend/           # API Node.js/Express
├── docker-compose.yml # Configuración de contenedores
└── package.json       # Scripts del monorepo
```

## 🛠️ Instalación

### Opción 1: Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm run install:all
   ```

2. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env` en la carpeta `backend/`
   - Configurar las variables de Firebase y PostgreSQL

3. **Levantar la base de datos:**
   ```bash
   docker-compose up postgres -d
   ```

4. **Ejecutar migraciones:**
   ```bash
   cd backend && npm run migrate
   ```

5. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

### Opción 2: Docker Compose

```bash
# Construir y levantar todos los servicios
npm run docker:up

# Detener servicios
npm run docker:down
```

## 🌐 Puertos

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## 📋 Funcionalidades

- ✅ CRUD de productos
- ✅ Gestión de stock
- ✅ Registro de ventas
- ✅ Generación de comprobantes PDF
- ✅ Autenticación con Firebase
- ✅ Roles de usuario (admin/usuario)
- ✅ API RESTful

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia frontend y backend en modo desarrollo
- `npm run dev:frontend` - Solo frontend
- `npm run dev:backend` - Solo backend
- `npm run build` - Construye el frontend para producción
- `npm run docker:up` - Levanta servicios con Docker
- `npm run docker:down` - Detiene servicios de Docker

## 📝 Variables de Entorno

Crear archivo `.env` en `backend/`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_stock
DB_USER=postgres
DB_PASSWORD=password

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY=tu-clave-privada
FIREBASE_CLIENT_EMAIL=tu-email

# JWT
JWT_SECRET=tu-secreto-jwt

# Puerto del servidor
PORT=5000
```
