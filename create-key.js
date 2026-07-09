import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ApiKey, Plan } from './backend/models/index.js';
dotenv.config();
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0");

async function run() {
  const plan = await Plan.findOne();
  if(!plan) {
    console.log("No plan found");
    return process.exit(1);
  }

  await ApiKey.updateOne({ name: 'Test Key' }, {
     $set: {
         key: 'test_api_key_123',
         userId: new mongoose.Types.ObjectId(),
         planId: plan._id,
         status: 'active'
     }
  }, { upsert: true });

  console.log("Key injected: test_api_key_123");
  process.exit(0);
}
run();
