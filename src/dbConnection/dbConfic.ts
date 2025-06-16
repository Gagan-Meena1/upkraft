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
    console.log('Establishing MongoDB connection to:', MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
    
    connectionPromise = mongoose.connect(MONGO_URL, {
      // Connection Pool Settings - Optimized for stability
      maxPoolSize: 10,              // Reduced for better stability
      minPoolSize: 2,
      maxIdleTimeMS: 45000,         // 45 seconds
      waitQueueTimeoutMS: 30000,    // Wait max 30s for connection from pool
      
      // Timeout Settings - More conservative for reliability
      serverSelectionTimeoutMS: 20000,  // 20 seconds to find server
      socketTimeoutMS: 120000,          // 2 minutes socket timeout
      connectTimeoutMS: 20000,          // 20 seconds to establish connection
      heartbeatFrequencyMS: 5000,       // Check server every 5 seconds
      
      // Performance Settings
      bufferCommands: true,
      
      // Reliability Settings
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      
      // Additional stability settings
      maxConnecting: 2,             // Limit concurrent connections
      family: 4,                    // Force IPv4
      
      // Auth settings
      authSource: 'admin',
    });

    const connection = await connectionPromise;
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    // Handle connection events
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

    // Handle connection timeout
    mongoose.connection.on('timeout', () => {
      console.log('MongoDB connection timeout');
      isConnected = false;
      connectionPromise = null;
    });

    // Handle server selection timeout
    mongoose.connection.on('serverSelectionError', (error) => {
      console.error('MongoDB server selection error:', error);
      isConnected = false;
      connectionPromise = null;
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

// Function to force reconnection
export async function forceReconnect() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    isConnected = false;
    connectionPromise = null;
    return await connect();
  } catch (error) {
    console.error('Force reconnect failed:', error);
    throw error;
  }
}