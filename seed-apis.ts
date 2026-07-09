import { connectToDatabase } from './backend/core/db.js';
import { ApiCatalog, ApiDocumentation } from './backend/models/index.js';
import mongoose from 'mongoose';

const APIs = [
  // UPLOAD
  { name: 'Image Upload', desc: 'Upload and host images securely.', category: 'Upload', endpoint: '/api/v1/upload/image', method: 'POST' },
  { name: 'Video Upload', desc: 'Upload video content.', category: 'Upload', endpoint: '/api/v1/upload/video', method: 'POST' },
  { name: 'Audio Upload', desc: 'Upload audio files.', category: 'Upload', endpoint: '/api/v1/upload/audio', method: 'POST' },
  { name: 'File Upload', desc: 'Upload any raw file format.', category: 'Upload', endpoint: '/api/v1/upload/file', method: 'POST' },
  
  // GOOGLE
  { name: 'Google Status', desc: 'Check Google provider health.', category: 'Google', endpoint: '/api/v1/google/status', method: 'GET' },
  { name: 'Google Keys', desc: 'Manage Google API keys.', category: 'Google', endpoint: '/api/v1/google/keys', method: 'GET' },
  
  // IMAGE
  { name: 'Compress Image', desc: 'Compress image size.', category: 'Image', endpoint: '/api/v1/image/compress', method: 'POST', params: { url: 'string', quality: 'number' } },
  { name: 'Resize Image', desc: 'Resize image dimensions.', category: 'Image', endpoint: '/api/v1/image/resize', method: 'POST', params: { url: 'string', width: 'number', height: 'number' } },
  { name: 'Remove Background', desc: 'Remove background from image.', category: 'Image', endpoint: '/api/v1/image/remove-background', method: 'POST', params: { url: 'string' } },
  
  // UTILITY
  { name: 'QR Code Generator', desc: 'Generate a QR code from text.', category: 'Utility', endpoint: '/api/v1/qr/generate', method: 'POST', params: { text: 'string', size: 'string' } },
  { name: 'URL Shortener', desc: 'Shorten a long URL.', category: 'Utility', endpoint: '/api/v1/url/shorten', method: 'POST', params: { url: 'string' } },
  { name: 'Password Generator', desc: 'Generate secure passwords.', category: 'Utility', endpoint: '/api/v1/password/generate', method: 'POST', params: { length: 'number' } },
  { name: 'Random Avatar', desc: 'Generate random user avatars.', category: 'Utility', endpoint: '/api/v1/random/avatar', method: 'GET', params: { seed: 'string' } },
  
  // AI AND TEXT
  { name: 'Text Summarizer', desc: 'Summarize long texts using AI.', category: 'AI', endpoint: '/api/v1/text/summarize', method: 'POST', params: { text: 'string', length: 'string' } },
  { name: 'Text Translator', desc: 'Translate text between languages.', category: 'AI', endpoint: '/api/v1/text/translate', method: 'POST', params: { text: 'string', to: 'string' } },
  
  // WEB
  { name: 'Website Screenshot', desc: 'Capture website screenshots.', category: 'Web', endpoint: '/api/v1/web/screenshot', method: 'POST', params: { url: 'string' } },
  
  // DATA
  { name: 'Crypto Price', desc: 'Get live cryptocurrency prices.', category: 'Data', endpoint: '/api/v1/crypto/price', method: 'GET', params: { symbol: 'string' } },
  { name: 'Weather Current', desc: 'Get real-time weather data.', category: 'Data', endpoint: '/api/v1/weather/current', method: 'GET', params: { lat: 'string', lon: 'string' } },
  { name: 'Latest News', desc: 'Get top news headlines.', category: 'Data', endpoint: '/api/v1/news/latest', method: 'GET', params: {} },
  { name: 'IP Location', desc: 'Locate IP address geographically.', category: 'Data', endpoint: '/api/v1/ip/location', method: 'GET', params: { ip: 'string' } },
  { name: 'Email Verifier', desc: 'Verify email syntax and status.', category: 'Data', endpoint: '/api/v1/email/verify', method: 'POST', params: { email: 'string' } }
];

async function run() {
  await connectToDatabase();
  
  for (const api of APIs) {
    // Upsert catalog
    let catalog = await ApiCatalog.findOne({ endpoint: api.endpoint });
    if (!catalog) {
      catalog = await ApiCatalog.create({
        name: api.name,
        description: api.desc,
        category: api.category,
        endpoint: api.endpoint,
        status: 'active',
        popularity: Math.floor(Math.random() * 500) + 100,
        latency: Math.floor(Math.random() * 150) + 50
      });
      console.log(`Created catalog for ${api.name}`);
    } else {
      await ApiCatalog.updateOne({ _id: catalog._id }, {
        $set: { category: api.category, description: api.desc, name: api.name }
      });
    }
    
    // Upsert documentation
    let doc = await ApiDocumentation.findOne({ apiId: catalog._id });
    if (!doc) {
      await ApiDocumentation.create({
        apiId: catalog._id,
        method: api.method,
        parameters: api.params || {},
        rateLimits: '100 requests per minute',
        responseSuccess: { success: true, result: '...' },
        responseError: { success: false, error: '...' }
      });
      console.log(`Created docs for ${api.name}`);
    } else {
      await ApiDocumentation.updateOne({ _id: doc._id }, {
        $set: { method: api.method, parameters: api.params || {} }
      });
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

run().catch(console.error);
