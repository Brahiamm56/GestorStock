# 🔍 DEBUG - Generación de PDFs

## 🚨 ERROR ACTUAL

```
[vite] http proxy error: /api/sales/.../receipt
Error: socket hang up
Failed to load resource: status 500
```

## 📋 PASOS DE DEBUG

### 1. VERIFICAR LOGS DEL BACKEND

**Abre la terminal donde corre el backend** y busca estos logs cuando intentas descargar el PDF:

```bash
🔍 [PDF] Generando comprobante para sale ID: ...
📊 [PDF] Venta encontrada: SÍ
📝 [PDF] Items en venta: X
👤 [PDF] Vendedor: ...
🧑 [PDF] Customer: ...
🔧 [PDF] Generando PDF...
[PDF] Estructura de venta: {...}
```

Si ves un **error después de "Generando PDF..."**, ese es el problema.

### 2. ERRORES COMUNES

#### Error: "Cannot find module 'pdfkit'"
**Solución**:
```bash
cd backend
npm install pdfkit
```

#### Error: relacionado con Customer o relaciones
Mostrar el error completo.

#### Error: "toLocaleString is not a function"
Problema con formateo de precios en pdfService.

### 3. REINICIAR BACKEND CON LOGS

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

### 4. PROBAR NUEVAMENTE

1. Ve a la página de Ventas: `http://localhost:5173/sales`
2. Haz clic en el botón PDF de una venta
3. **Observa la terminal del backend** para ver qué error aparece

---

## 🔧 VERIFICACIONES RÁPIDAS

### Backend corriendo en puerto 3000:
```bash
lsof -i :3000
# Deberías ver: node ... *:3000 (LISTEN)
```

### Frontend corriendo en puerto 5173:
```bash
lsof -i :5173
# Deberías ver: node ... *:5173 (LISTEN)
```

### PDFKit instalado:
```bash
cd backend
npm list pdfkit
# Deberías ver: pdfkit@X.X.X
```

---

## 📝 INFORMACIÓN NECESARIA

Por favor comparte:

1. **Logs completos del backend** cuando intentas descargar el PDF
2. **Error exacto** que aparece después de "🔧 [PDF] Generando PDF..."
3. **Versión de Node.js**: `node --version`

---

## 🎯 SOLUCIONES POSIBLES

### Si el error es "Cannot find module 'pdfkit'":
```bash
cd backend
npm install pdfkit
npm run dev
```

### Si el error es relacionado con formateo:
Verificar que los precios en la venta sean números válidos.

### Si el error es "socket hang up":
El PDF se está generando pero hay un timeout o error de memoria.

---

## 🧪 TEST SIMPLE

Crea un endpoint de prueba en `backend/routes/sales.js`:

```javascript
router.get('/test-pdf', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    });
    
    doc.fontSize(20).text('Test PDF', 100, 100);
    doc.end();
  } catch (error) {
    console.error('Error test PDF:', error);
    res.status(500).json({ error: error.message });
  }
});
```

Luego prueba: `http://localhost:3000/api/sales/test-pdf`

Si este endpoint funciona, el problema está en la generación del PDF con datos de la venta.
Si falla, hay un problema con pdfkit.

---

**Próximo paso**: Comparte los logs del backend cuando intentas generar el PDF.
