const { User } = require('../models');
const { verifyFirebaseToken } = require('../config/firebase');

const authController = {
  // Verificar token y obtener información del usuario
  async verifyToken(req, res) {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      const decodedToken = await verifyFirebaseToken(idToken);
      
      // Buscar o crear usuario en la base de datos
      let user = await User.findOne({
        where: { firebase_uid: decodedToken.uid }
      });

      if (!user) {
        // Crear nuevo usuario
        user = await User.create({
          firebase_uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split('@')[0],
          role: 'user'
        });
      } else {
        // Actualizar último login
        await user.update({ last_login: new Date() });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active
        }
      });
    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  },

  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.uid);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          last_login: user.last_login
        }
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const user = await User.findByPk(req.user.uid);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await user.update(updateData);

      res.json({
        message: 'Perfil actualizado correctamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;
