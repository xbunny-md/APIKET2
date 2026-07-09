import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0");

const GoogleKeySchema = new mongoose.Schema({}, { collection: 'google_keys', strict: false });
const GoogleKey = mongoose.model('GoogleKey', GoogleKeySchema);

async function run() {
  await GoogleKey.updateOne(
    { name: 'Test Key' },
    { $set: { 
        key: 'invalid_key_123',
        priority: 100,
        status: 'active',
        healthScore: 100
    }},
    { upsert: true }
  );
  
  console.log("Test Google Key injected.");
  
  // Create an API key or use existing
  // Or test it locally if we disable auth on the test script 
  process.exit(0);
}
run();
