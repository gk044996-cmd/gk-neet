require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gk-neet';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await mongoose.connection.collection('users').dropIndex('firebaseUid_1');
      console.log('Dropped firebaseUid_1 index');
    } catch (err) {
      console.log('Error dropping index (might not exist):', err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
