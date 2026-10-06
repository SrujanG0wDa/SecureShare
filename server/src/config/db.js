const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom DNS servers (Google 8.8.8.8 & Cloudflare 1.1.1.1)
// to prevent Windows ESERVFAIL DNS lookup issues on MongoDB Atlas SRV/TXT records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables.');
    return;
  }

  try {
    console.log('📡 Connecting to MongoDB Atlas database...');
    mongoose.set('bufferTimeoutMS', 5000);
    const conn = await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Please verify your MONGODB_URI in server/.env');
  }
};

module.exports = { connectDB };
