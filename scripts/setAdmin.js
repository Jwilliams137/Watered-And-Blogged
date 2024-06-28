require('dotenv').config(); // Load environment variables from .env file

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('../credentials/firebase-creds'); // Adjust the path as per your file structure

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Admin claim set for user ${email}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
}

// Call this function with the email from your environment variables
const adminEmail = process.env.NEXT_PUBLIC_EMAIL;
setAdmin(adminEmail);



