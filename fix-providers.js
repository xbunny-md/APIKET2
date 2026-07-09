import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0");

const ProviderSchema = new mongoose.Schema({
  name: String,
  category: String,
  priority: Number,
  supportedEndpoints: [String],
  enabled: Boolean,
  config: Object,
  healthScore: Number,
  latency: Number,
  successRate: Number,
  lastSuccess: Date,
  lastFailure: Date,
  status: String,
  retryCount: Number,
  timeout: Number
}, { collection: 'providers' });

const Provider = mongoose.model('Provider', ProviderSchema);

async function run() {
  await Provider.updateMany({ name: 'TikTok Public Scraper 1' }, { $set: { 'config.baseUrl': 'https://www.tikwm.com/api', retryCount: 2, timeout: 8000 }});
  await Provider.updateMany({ name: 'TikTok Alternative API' }, { $set: { 'config.baseUrl': 'https://www.tikwm.com/api', retryCount: 2, timeout: 8000 }});
  await Provider.updateMany({ name: 'YouTube Data V3' }, { $set: { 'config.baseUrl': 'https://pipedapi.kavin.rocks', retryCount: 2, timeout: 10000 }});
  await Provider.updateMany({ name: 'Jikan API' }, { $set: { 'config.baseUrl': 'https://api.jikan.moe/v4', retryCount: 2, timeout: 8000 }});
  console.log("Providers updated!");
  process.exit(0);
}
run();
