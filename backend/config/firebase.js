const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
    }
    console.log('✅ Firebase Admin SDK inicializado correctamente');
    return admin;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error);
    throw error;
  }
};

// Verificar token de Firebase
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error al verificar token de Firebase:', error);
    throw new Error('Token inválido');
  }
};

module.exports = {
  admin: initializeFirebase(),
  verifyFirebaseToken
};
