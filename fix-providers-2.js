import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0");

const ProviderSchema = new mongoose.Schema({}, { collection: 'providers', strict: false });
const Provider = mongoose.model('Provider', ProviderSchema);

async function run() {
  await Provider.updateMany({ category: 'Memes' }, { $set: { 'config.baseUrl': 'https://meme-api.com', retryCount: 2, timeout: 8000 }});
  await Provider.updateMany({ category: 'Images' }, { $set: { 'config.baseUrl': 'https://picsum.photos', retryCount: 2, timeout: 8000 }});
  await Provider.updateMany({ category: 'Stickers' }, { $set: { 'config.baseUrl': 'https://api.giphy.com/v1', retryCount: 2, timeout: 8000 }});
  console.log("Other Providers updated!");
  process.exit(0);
}
run();
