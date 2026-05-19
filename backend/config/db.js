const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gk-neet';

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Initializing new MongoDB connection...");
    console.log("Mongo URI exists:", !!process.env.MONGO_URI);
    
    mongoose.set('bufferCommands', false);
    
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
    }).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    }).catch(err => {
      console.error("MongoDB Connection failed during promise:", err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", err);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
