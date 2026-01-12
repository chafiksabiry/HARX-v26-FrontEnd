import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Check if we have a valid cached connection
  if (cached.conn) {
    // Verify the connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is stale, clear it
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds instead of default 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    // Clear the cached connection on error
    cached.conn = null;
    console.error('MongoDB connection error:', e.message);
    
    // Provide more helpful error messages
    let errorMessage = `Database connection failed: ${e.message}`;
    if (e.message.includes('timeout')) {
      errorMessage += '. Please check if MongoDB is running and accessible.';
    } else if (e.message.includes('ENOTFOUND') || e.message.includes('getaddrinfo')) {
      errorMessage += '. DNS resolution failed - check your MongoDB host address.';
    } else if (e.message.includes('authentication')) {
      errorMessage += '. Check your MongoDB credentials.';
    }
    
    throw new Error(errorMessage);
  }

  return cached.conn;
}

export default dbConnect;



