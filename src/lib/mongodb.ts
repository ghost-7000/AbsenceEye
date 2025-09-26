import mongoose from 'mongoose';
import { seedDatabase } from './seed';

const MONGODB_URI = "mongodb+srv://kdmdfd86_db_user:l5x6ivaIf24tdNQl@cluster0.qhl9tub.mongodb.net/AbsenceEyeDB?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Augment the global object with a mongoose property
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // console.log("Using cached DB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Creating new DB connection promise");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      console.log("DB Connected. Seeding database if necessary...");
      // Seed the database right after connection
      await seedDatabase();
      console.log("Seeding complete.");
      return mongoose;
    });
  }
  
  try {
    // console.log("Awaiting DB connection promise");
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  // console.log("DB connection successful");
  return cached.conn;
}

export default dbConnect;
