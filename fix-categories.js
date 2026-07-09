import mongoose from 'mongoose';
import { connectToDatabase } from './backend/core/db.js';
import { ApiCatalog } from './backend/models/index.js';

async function run() {
  await connectToDatabase();
  
  await ApiCatalog.updateMany({ category: 'Social Media' }, { $set: { category: 'Social' } });
  await ApiCatalog.updateMany({ category: 'Entertainment' }, { $set: { category: 'Anime' } });
  
  console.log("Categories fixed");
  process.exit(0);
}
run();
