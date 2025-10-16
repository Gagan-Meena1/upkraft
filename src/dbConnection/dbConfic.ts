import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL!;

if (!MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}

// Connection state tracking
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connect() {
  // Return existing connection promise to avoid multiple concurrent connections
  if (connectionPromise) {
    return connectionPromise;
  }
  
  // Return early if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    console.log('Establishing MongoDB connection...');
    
    connectionPromise = mongoose.connect(MONGO_URL, {
      // Timeout settings
      serverSelectionTimeoutMS: 60000,  // 15 seconds
      connectTimeoutMS: 60000,          // 15 seconds
      socketTimeoutMS: 60000,           // 45 seconds
      
       // Connection Pool Settings - CRITICAL for your user count
        maxPoolSize: 100,                   // Increased significantly
        minPoolSize: 10,                    // Keep minimum connections ready
        maxIdleTimeMS: 30000,               // Close idle connections after 30s
        waitQueueTimeoutMS: 10000,          // Queue timeout for getting connections
      
      // Reliability Settings
      retryWrites: true,
      w: 'majority',
      
      // Buffer settings (use defaults)
      bufferCommands: true,
    });

    const connection = await connectionPromise;
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

    return connection;
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    isConnected = false;
    connectionPromise = null;
    throw error;
  }
}

// Helper function to check connection status
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Graceful shutdown
export async function disconnect() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    isConnected = false;
    connectionPromise = null;
    console.log('MongoDB disconnected gracefully');
  } catch (error) {
    console.error('Error during MongoDB disconnection:', error);
  }
}