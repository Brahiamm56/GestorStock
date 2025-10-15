const admin = require('firebase-admin');

function assertEnvVars(keys = []) {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars for Firebase: ${missing.join(', ')}`);
  }
}

// Inicializar Firebase Admin SDK (valida env vars y normaliza private key)
const initializeFirebase = () => {
  assertEnvVars(['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']);

  try {
    if (!admin.apps.length) {
      const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || '';
      // Normalizar saltos de línea solo si existe la clave
      const privateKey = privateKeyRaw.includes('\\n')
        ? privateKeyRaw.replace(/\\n/g, '\n')
        : privateKeyRaw;

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });

      console.log('✅ Firebase Admin SDK inicializado correctamente');
    }
    return admin;
  } catch (error) {
    // No loguear secrets; registrar sólo mensaje controlado
    console.error('❌ Error al inicializar Firebase Admin SDK:', error?.message || error);
    throw error;
  }
};

// Verificar token de Firebase (propaga el error original para permitir manejo fino)
const verifyFirebaseToken = async (idToken) => {
  try {
    // admin puede estar inicializado por initializeFirebase()
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    // Registrar para debugging pero propagar el error original al caller
    console.error('Error al verificar token de Firebase:', error?.message || error);
    throw error;
  }
};

// Inicializar al require para fallar temprano si faltan variables
const adminInstance = initializeFirebase();

module.exports = {
  admin: adminInstance,
  verifyFirebaseToken,
  initializeFirebase
};