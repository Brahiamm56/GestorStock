# ✅ PUERTO ACTUALIZADO - DE 5000 A 3000

## 🎉 CAMBIOS COMPLETADOS

### 1️⃣ ✅ BACKEND/SERVER.JS
- **Puerto cambiado**: 5000 → 3000
- **Línea 24**: `const PORT = process.env.PORT || 3000;`
- **Manejo de errores mejorado**: Mensajes claros si el puerto está en uso
- **Logs mejorados**: Banner visual al iniciar el servidor

### 2️⃣ ✅ BACKEND/.ENV
- **Puerto actualizado**: `PORT=3000`
- Archivo modificado automáticamente

### 3️⃣ ✅ FRONTEND/.ENV
- **Nueva variable agregada**: `VITE_API_URL=http://localhost:3000/api`
- El frontend ahora apunta al puerto 3000

### 4️⃣ ✅ BACKEND/PACKAGE.JSON
- **Nuevos scripts agregados**:
  - `npm run kill-port` - Mata proceso en puerto 3000
  - `npm run clean-dev` - Limpia puerto y inicia servidor

---

## 🚀 CÓMO INICIAR AHORA

### Opción 1: Inicio Normal
```bash
cd backend
npm run dev
```

### Opción 2: Inicio con Limpieza Automática (RECOMENDADO)
```bash
cd backend
npm run clean-dev
```

### Opción 3: Limpieza Manual + Inicio
```bash
cd backend
npm run kill-port
npm run dev
```

---

## ✅ RESULTADO ESPERADO

Al ejecutar `npm run dev`, deberías ver:

```
[nodemon] starting `node server.js`
✅ Firebase Admin SDK inicializado correctamente
Executing (default): SELECT 1+1 AS result
info: ✅ Conexión a la base de datos establecida correctamente
info: ✅ Modelos sincronizados con la base de datos
═══════════════════════════════════════
🚀 SERVIDOR INICIADO CORRECTAMENTE
═══════════════════════════════════════
📍 URL Local:    http://localhost:3000
🔧 Entorno:      development
📊 Base de Datos: SQLite
🔗 API:          http://localhost:3000/api
═══════════════════════════════════════
```

**SIN ERRORES DE EADDRINUSE** ✅

---

## 🔧 FRONTEND - TAMBIÉN ACTUALIZADO

El archivo `frontend/.env` ahora contiene:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=AIzaSyAvDYFche6vtuJ43d7_LGdXdKnRBkyPG-M
VITE_FIREBASE_AUTH_DOMAIN=gestor-stock-192ae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gestor-stock-192ae
VITE_FIREBASE_STORAGE_BUCKET=gestor-stock-192ae.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=764451226636
```

Para que surta efecto, **REINICIA EL FRONTEND**:

```bash
# Detener el frontend (Ctrl+C)
# Luego reiniciar:
cd frontend
npm run dev
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [x] Puerto cambiado en `backend/server.js` (3000)
- [x] Puerto actualizado en `backend/.env` (PORT=3000)
- [x] URL de API actualizada en `frontend/.env`
- [x] Scripts de limpieza agregados a `package.json`
- [x] Manejo de errores mejorado
- [ ] **PENDIENTE: Reiniciar backend**
- [ ] **PENDIENTE: Reiniciar frontend**
- [ ] **PENDIENTE: Probar generación de PDFs**

---

## 🐛 SI SIGUE FALLANDO

### Error: Puerto 3000 en uso

Si ves este error al iniciar:
```
❌ ERROR: PUERTO 3000 YA ESTÁ EN USO
```

**Solución rápida**:
```bash
npm run kill-port
npm run dev
```

O manualmente:
```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# Matar ese proceso (reemplaza PID con el número que aparece)
kill -9 <PID>

# O directamente:
fuser -k 3000/tcp
```

### Error: Cannot find module

Si ves errores de módulos faltantes:
```bash
cd backend
npm install
```

### Frontend no conecta con backend

Verifica que:
1. Backend esté corriendo en puerto 3000
2. Frontend tenga `VITE_API_URL=http://localhost:3000/api` en `.env`
3. Hayas reiniciado el frontend después de cambiar `.env`

---

## 🎯 PRÓXIMOS PASOS

1. **Inicia el backend**:
   ```bash
   cd backend
   npm run clean-dev
   ```

2. **Espera a que inicie correctamente** (ver banner de inicio)

3. **Reinicia el frontend** (en otra terminal):
   ```bash
   cd frontend
   # Ctrl+C para detener si está corriendo
   npm run dev
   ```

4. **Abre el navegador**: `http://localhost:5173`

5. **Prueba la generación de PDFs**:
   - Ve a Ventas
   - Haz clic en el botón PDF de cualquier venta
   - Debería descargar correctamente

---

## 📝 ARCHIVOS MODIFICADOS

```
✅ backend/server.js         - Puerto 3000, manejo de errores mejorado
✅ backend/.env              - PORT=3000
✅ backend/package.json      - Scripts kill-port y clean-dev
✅ frontend/.env             - VITE_API_URL=http://localhost:3000/api
```

---

## 🎉 BENEFICIOS DE LOS CAMBIOS

### 1. Puerto 3000 (Estándar)
- Puerto más común para APIs Node.js
- Menos conflictos con otros servicios

### 2. Scripts de Limpieza
- `npm run kill-port` - Limpia el puerto automáticamente
- `npm run clean-dev` - Todo en uno: limpia e inicia

### 3. Manejo de Errores Mejorado
- Mensajes claros si hay problemas
- Soluciones sugeridas en pantalla
- Logs más informativos

### 4. Configuración Centralizada
- Todo en variables de entorno
- Fácil cambiar de puerto si es necesario
- Frontend y backend sincronizados

---

## 🔐 SEGURIDAD

Las variables de Firebase siguen intactas:
- ✅ Credenciales de Firebase Admin
- ✅ API Keys del frontend
- ✅ Configuración de autenticación

---

## 📞 COMANDOS ÚTILES

### Ver qué usa el puerto 3000:
```bash
lsof -i :3000
```

### Matar proceso en puerto 3000:
```bash
fuser -k 3000/tcp
```

### Ver todos los puertos en uso:
```bash
netstat -tulpn | grep LISTEN
```

### Verificar que el backend responde:
```bash
curl http://localhost:3000/api/health
```

---

## ✨ RESUMEN EJECUTIVO

**Estado**: ✅ **COMPLETADO**

**Cambios**:
- Puerto backend: 5000 → **3000**
- Frontend apunta a: **http://localhost:3000/api**
- Scripts de limpieza: **Agregados**
- Manejo de errores: **Mejorado**

**Próxima acción**:
```bash
cd backend && npm run clean-dev
```

**Resultado esperado**: Servidor iniciando en puerto 3000 sin errores ✅

---

**Fecha**: Noviembre 10, 2025  
**Estado**: ✅ **LISTO PARA USAR**
