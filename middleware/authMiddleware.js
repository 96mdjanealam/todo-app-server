const admin = require("firebase-admin");

const serviceAccount = require("../simple-firebase-39f4b-firebase-adminsdk-dw595-bc14c1abea.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach user info to the request object
      next();
    } catch (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };
  
  module.exports = authenticateUser;