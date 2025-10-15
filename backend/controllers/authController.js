const { User } = require('../models');
const { verifyFirebaseToken } = require('../config/firebase');

const authController = {
  // Verificar token y obtener información del usuario
  async verifyToken(req, res) {
    try {
      // aceptar idToken en body o en header Authorization: Bearer <token>
      let idToken = req.body?.idToken;
      if (!idToken) {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          idToken = authHeader.split(' ')[1];
        }
      }

      if (!idToken) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      let decodedToken;
      try {
        decodedToken = await verifyFirebaseToken(idToken);
      } catch (firebaseError) {
        console.error('Firebase token verification error:', firebaseError?.message || firebaseError);
        // detectar token expirado y avisar al cliente para reintentar getIdToken(true)
        if (firebaseError?.code === 'auth/id-token-expired' || (firebaseError.message && firebaseError.message.includes('expired'))) {
          return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Buscar usuario en la base de datos por firebase_uid
      let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });

      if (!user) {
        // Crear nuevo usuario mínimo si no existe
        user = await User.create({
          firebase_uid: decodedToken.uid,
          email: decodedToken.email || null,
          name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Usuario'),
          role: 'user',
          is_active: true,
          last_login: new Date(),
          profile_image: null
        });
      } else {
        // Actualizar último login
        await user.update({ last_login: new Date() });
      }

      // Responder con el objeto user
      res.json({
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          profile_image: user.profile_image || null,
          phone: user.phone || null,
          created_at: user.created_at || user.createdAt || null,
          last_login: user.last_login || null
        }
      });
    } catch (error) {
      console.error('Error en verifyToken:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      let user = null;

      // req.user puede ser el modelo, o un objeto con id/uid/firebase_uid/email
      if (req.user.id) {
        user = await User.findByPk(req.user.id);
      } else if (req.user.uid || req.user.firebase_uid) {
        const uid = req.user.uid || req.user.firebase_uid;
        user = await User.findOne({ where: { firebase_uid: uid } });
      } else if (req.user.email) {
        user = await User.findOne({ where: { email: req.user.email } });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          profile_image: user.profile_image || null,
          phone: user.phone || null,
          created_at: user.created_at || user.createdAt || null,
          last_login: user.last_login || null
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
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      let user = null;

      if (req.user.id) {
        user = await User.findByPk(req.user.id);
      } else if (req.user.uid || req.user.firebase_uid) {
        const uid = req.user.uid || req.user.firebase_uid;
        user = await User.findOne({ where: { firebase_uid: uid } });
      } else if (req.user.email) {
        user = await User.findOne({ where: { email: req.user.email } });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const { name, email, phone, profile_image } = req.body;
      const updateData = {};
      if (typeof name !== 'undefined') updateData.name = name;
      if (typeof email !== 'undefined') updateData.email = email;
      if (typeof phone !== 'undefined') updateData.phone = phone;
      // permitir null para borrar imagen si se envía explícitamente
      if (typeof profile_image !== 'undefined') updateData.profile_image = profile_image;

      await user.update(updateData);

      res.json({
        message: 'Perfil actualizado correctamente',
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          profile_image: user.profile_image || null,
          phone: user.phone || null
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;