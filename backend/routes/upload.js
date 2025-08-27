const express = require('express')
const router = express.Router()
const { uploadImage, handleUploadError } = require('../middleware/upload')
const { authenticateToken } = require('../middleware/auth')
const path = require('path')

// Ruta para subir imagen
router.post('/image', 
  authenticateToken, 
  uploadImage, 
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        })
      }

      // Generar URL de la imagen
      const imageUrl = `/uploads/${req.file.filename}`

      res.json({
        success: true,
        message: 'Imagen subida correctamente',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: imageUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      })
    } catch (error) {
      console.error('Error al subir imagen:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
)

// Ruta para servir archivos estáticos
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, '../uploads', filename)
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      })
    }
  })
})

module.exports = router
