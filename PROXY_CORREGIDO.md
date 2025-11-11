# ✅ PROXY CORREGIDO - Vite Conectado al Backend

## 🔧 PROBLEMA RESUELTO

**Error Original**:
```
[vite] http proxy error: /api/auth/verify
AggregateError [ECONNREFUSED]
```

**Causa**: El proxy de Vite estaba apuntando al puerto 5000, pero el backend ahora está en el puerto 3000.

## ✅ CAMBIOS APLICADOS

### Archivo: `frontend/vite.config.js`

**ANTES** ❌:
```javascript
server: {
  port: 3000,  // ❌ Conflicto con backend
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // ❌ Backend ya no está aquí
      changeOrigin: true
    }
  }
}
```

**DESPUÉS** ✅:
```javascript
server: {
  port: 5173,  // ✅ Puerto estándar de Vite
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // ✅ Backend está aquí ahora
      changeOrigin: true
    }
  }
}
```

---

## 🚀 CÓMO REINICIAR EL FRONTEND

**En la terminal donde corre el frontend**:

1. **Detener el servidor** (presiona `Ctrl + C`)

2. **Reiniciar**:
```bash
npm run dev
```

3. **Resultado esperado**:
```
VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 VERIFICAR QUE FUNCIONA

### 1. Backend corriendo ✅
```bash
# Verificar que el backend esté en puerto 3000:
lsof -i :3000
# Deberías ver: node ... *:3000 (LISTEN)
```

### 2. Frontend corriendo ✅
```bash
# Verificar que el frontend esté en puerto 5173:
lsof -i :5173
# Deberías ver: node ... *:5173 (LISTEN)
```

### 3. Proxy funcionando ✅
- Abre: `http://localhost:5173`
- Intenta hacer **login**
- Debería funcionar sin errores de proxy

---

## 📊 CONFIGURACIÓN FINAL

```
┌─────────────────────────────────────────┐
│         ARQUITECTURA ACTUAL             │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Vite)                        │
│  Puerto: 5173                           │
│  URL: http://localhost:5173             │
│         │                               │
│         │ Proxy /api -> :3000           │
│         │ Proxy /uploads -> :3000       │
│         ↓                               │
│  Backend (Express)                      │
│  Puerto: 3000                           │
│  URL: http://localhost:3000/api         │
│         │                               │
│         ↓                               │
│  Base de Datos (SQLite)                 │
│  Archivo: database.sqlite               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🐛 SI SIGUE SIN FUNCIONAR

### Error: ECONNREFUSED persiste

**Verifica que el backend esté corriendo**:
```bash
cd backend
npm run dev
```

Deberías ver:
```
═══════════════════════════════════════
🚀 SERVIDOR INICIADO CORRECTAMENTE
═══════════════════════════════════════
📍 URL Local:    http://localhost:3000
```

### Error: Cannot GET /api/auth/verify

Si ves este error directamente en el navegador:
1. El backend está corriendo ✅
2. Pero el frontend no está usando el proxy ❌

**Solución**: Asegúrate de acceder vía `http://localhost:5173` (puerto del frontend), NO `http://localhost:3000`.

### Error: Port 5173 already in use

Alguien está usando el puerto 5173:
```bash
# Ver qué proceso lo usa:
lsof -i :5173

# Matarlo:
fuser -k 5173/tcp
```

---

## 📝 RESUMEN DE PUERTOS

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Frontend** | 5173 | http://localhost:5173 |
| **Backend** | 3000 | http://localhost:3000/api |
| **Base de Datos** | - | database.sqlite (local) |

---

## ✅ CHECKLIST POST-CORRECCIÓN

- [x] vite.config.js actualizado (puerto 5173)
- [x] Proxy apuntando a :3000
- [x] Backend corriendo en :3000
- [ ] **PENDIENTE: Reiniciar frontend**
- [ ] **PENDIENTE: Probar login**
- [ ] **PENDIENTE: Probar generación de PDFs**

---

## 🎉 RESULTADO ESPERADO

Después de reiniciar el frontend:

1. **Login funciona** ✅
2. **No hay errores de proxy** ✅
3. **PDFs se generan correctamente** ✅
4. **Todas las peticiones a /api funcionan** ✅

---

## 🔍 LOGS QUE DEBERÍAS VER

### En el Frontend (consola del navegador):
```
🔍 API Request: POST /auth/verify
✅ Token agregado al request
```

### En el Backend (terminal):
```
🔐 Verificando autenticación...
🔐 Headers: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Token verificado: Pr6SslzcQHd2CkLtKoTnJME22E72
👤 Usuario autenticado: { uid: '...', email: '...', role: 'admin' }
```

---

## 🚨 IMPORTANTE

**NO abras directamente**: `http://localhost:3000`  
**SÍ abre**: `http://localhost:5173`

El frontend en puerto 5173 hace proxy automático al backend en puerto 3000.

---

## 📞 COMANDOS ÚTILES

### Ver todos los puertos en uso:
```bash
netstat -tulpn | grep LISTEN
```

### Reiniciar todo desde cero:
```bash
# Terminal 1: Backend
cd backend
npm run clean-dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Ver logs del proxy en Vite:
El log `[vite] http proxy error` ya no debería aparecer.

---

**Estado**: ✅ **PROXY CORREGIDO**  
**Próximo paso**: Reinicia el frontend con `npm run dev`  
**Fecha**: Noviembre 10, 2025
