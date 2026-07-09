import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0");

const ProviderSchema = new mongoose.Schema({}, { collection: 'providers', strict: false });
const Provider = mongoose.model('Provider', ProviderSchema);

async function run() {
  await Provider.updateOne(
    { name: 'Google API Key Fallback', category: 'YouTube' },
    { $set: { 
        status: 'healthy', 
        enabled: true, 
        priority: 10,
        retryCount: 2,
        timeout: 8000
    }},
    { upsert: true }
  );
  
  await Provider.updateOne(
    { name: 'Cloudinary', category: 'Upload' },
    { $set: { 
        status: 'healthy', 
        enabled: true, 
        priority: 1,
        retryCount: 3,
        timeout: 10000,
        credentials: {
           cloudName: 'demo',
           apiKey: '1234567890',
           apiSecret: 'secret'
        }
    }},
    { upsert: true }
  );

  await Provider.updateOne(
    { name: 'Freeimage.host', category: 'Upload' },
    { $set: { 
        status: 'healthy', 
        enabled: true, 
        priority: 2,
        retryCount: 2,
        timeout: 8000,
        config: { baseUrl: 'https://freeimage.host/api/1/upload' },
        credentials: { apiKey: '6d207e02198a847aa98d0a2a901485a5' }
    }},
    { upsert: true }
  );
  
  console.log("Providers for upload and youtube updated!");
  process.exit(0);
}
run();
