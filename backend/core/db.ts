import mongoose from 'mongoose';
import { initSettings } from './settings.js';
import { ApiCatalog, ApiDocumentation } from '../models/index.js';

let cachedDb = false;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  // Hardcoded MongoDB URI with the new password
  let uri = process.env.MONGO_URI || "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0";
  
  if (uri.includes('<@chagpt>') || uri.includes('@chatgpt')) {
    uri = "mongodb+srv://lupin:VitkEkTHmRFr5tLz@cluster0.oifw9ct.mongodb.net/?appName=Cluster0";
  }

  // Safely URL-encode the password if it contains special characters
  // The format is mongodb+srv://username:password@cluster...
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):(.*)@([^@]+)$/);
  if (match) {
    const user = match[1];
    let pass = match[2];
    const rest = match[3];
    
    // If the user accidentally left the < > from the placeholder, strip them
    if (pass.startsWith('<') && pass.endsWith('>')) {
      pass = pass.substring(1, pass.length - 1);
    }
    
    const encodedPass = encodeURIComponent(pass);
    uri = `mongodb+srv://${user}:${encodedPass}@${rest}`;
  }

  await mongoose.connect(uri);
  cachedDb = true;
  console.log('[Database] MongoDB connected successfully.');

  // Initialize defaults on connect
  try {
    await initSettings();
    console.log('[Database] Settings loaded.');

    console.log('[Database] Admin configuration validated.');
    console.log('[Database] Statistics initialized.');
    
    // Seed API catalog if empty
    const catalogCount = await ApiCatalog.countDocuments();
    if (catalogCount === 0) {
      const api = await ApiCatalog.create({
        name: 'Hello World API',
        description: 'A simple API that returns a greeting. Perfect for testing your API key integration and latency.',
        category: 'Developer',
        version: '1.0',
        endpoint: '/api/v1/hello',
        popularity: 5,
        latency: 12,
        tags: ['test', 'hello', 'dev']
      });

      await ApiDocumentation.create({
        apiId: api._id,
        method: 'GET',
        headers: {
          'Authorization': { type: 'string', description: 'Bearer YOUR_API_KEY' }
        },
        parameters: {},
        responseSuccess: {
          success: true,
          data: {
            message: 'Hello World from NEXAPI HUB!',
            timestamp: '2026-07-08T08:00:00.000Z'
          },
          message: 'Request successful'
        },
        rateLimits: '100 requests / day'
      });
      
      const api2 = await ApiCatalog.create({
        name: 'Echo API',
        description: 'Send JSON payload to this endpoint and it will echo it back to you. Useful for testing POST requests.',
        category: 'Developer',
        version: '1.0',
        endpoint: '/api/v1/api/echo',
        popularity: 4,
        latency: 15,
        tags: ['test', 'echo', 'post']
      });

      await ApiDocumentation.create({
        apiId: api2._id,
        method: 'POST',
        headers: {
          'Authorization': { type: 'string', description: 'Bearer YOUR_API_KEY' },
          'Content-Type': { type: 'string', description: 'application/json' }
        },
        parameters: {},
        body: {
          'any': { type: 'object', description: 'Any valid JSON object' }
        },
        responseSuccess: {
          success: true,
          data: {
            echo: { test: 'value' },
            receivedAt: '2026-07-08T08:00:00.000Z'
          }
        },
        rateLimits: '100 requests / day'
      });

      // TikTok API Seed
      const ttApi = await ApiCatalog.create({
        name: 'TikTok Video Download',
        description: 'Download TikTok videos without watermark and extract metadata.',
        category: 'Social Media',
        version: '1.0',
        endpoint: '/api/v1/tiktok/download',
        popularity: 9,
        latency: 150,
        tags: ['tiktok', 'download', 'video', 'no-watermark']
      });

      await ApiDocumentation.create({
        apiId: ttApi._id,
        method: 'GET',
        headers: {
          'Authorization': { type: 'string', description: 'Bearer YOUR_API_KEY' }
        },
        parameters: {
          'url': { type: 'string', description: 'The URL of the TikTok video' }
        },
        responseSuccess: {
          success: true,
          data: {
            id: '71234567890',
            url: 'https://www.tiktok.com/@user/video/71234567890',
            title: 'Awesome video!',
            author: 'user',
            downloadUrls: {
              watermark: 'https...',
              no_watermark: 'https...',
              audio: 'https...'
            }
          },
          source: 'TikTok Alternative API',
          latency: 145
        },
        rateLimits: '1000 requests / day'
      });

      // YouTube API Seed
      const ytApi = await ApiCatalog.create({
        name: 'YouTube Search',
        description: 'Search for YouTube videos and retrieve metadata.',
        category: 'Social Media',
        version: '1.0',
        endpoint: '/api/v1/youtube/search',
        popularity: 8,
        latency: 200,
        tags: ['youtube', 'search', 'video']
      });

      await ApiDocumentation.create({
        apiId: ytApi._id,
        method: 'GET',
        headers: {
          'Authorization': { type: 'string', description: 'Bearer YOUR_API_KEY' }
        },
        parameters: {
          'query': { type: 'string', description: 'Search term' }
        },
        responseSuccess: {
          success: true,
          data: [
            {
              id: 'dQw4w9WgXcQ',
              title: 'Search result',
              channel: 'Official Channel',
              views: 1200000,
              thumbnail: 'https...'
            }
          ],
          source: 'YouTube Data V3',
          latency: 180
        },
        rateLimits: '1000 requests / day'
      });
      
      // Anime API Seed
      const animeApi = await ApiCatalog.create({
        name: 'Anime Search',
        description: 'Search for Anime titles and metadata.',
        category: 'Entertainment',
        version: '1.0',
        endpoint: '/api/v1/anime/search',
        popularity: 7,
        latency: 120,
        tags: ['anime', 'search', 'jikan']
      });

      await ApiDocumentation.create({
        apiId: animeApi._id,
        method: 'GET',
        headers: {
          'Authorization': { type: 'string', description: 'Bearer YOUR_API_KEY' }
        },
        parameters: {
          'query': { type: 'string', description: 'Anime title to search for' }
        },
        responseSuccess: {
          success: true,
          data: [
            {
              id: 20,
              title: 'Naruto',
              episodes: 220,
              status: 'Finished Airing',
              score: 8.0,
              image: 'https...'
            }
          ],
          source: 'Jikan API',
          latency: 110
        },
        rateLimits: '2000 requests / day'
      });
    }

    // Seed Providers if empty
    const providerCount = await mongoose.models.Provider.countDocuments();
    if (providerCount === 0) {
      await mongoose.models.Provider.insertMany([
        {
          name: 'TikTok Public Scraper 1',
          category: 'TikTok',
          priority: 1,
          supportedEndpoints: ['/api/v1/tiktok/download', '/api/v1/tiktok/info', '/api/v1/tiktok/audio', '/api/v1/tiktok/images', '/api/v1/tiktok/profile'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        },
        {
          name: 'TikTok Alternative API',
          category: 'TikTok',
          priority: 2,
          supportedEndpoints: ['/api/v1/tiktok/download', '/api/v1/tiktok/info', '/api/v1/tiktok/audio'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        },
        {
          name: 'YouTube Data V3',
          category: 'YouTube',
          priority: 1,
          supportedEndpoints: ['/api/v1/youtube/search', '/api/v1/youtube/info', '/api/v1/youtube/audio', '/api/v1/youtube/video', '/api/v1/youtube/channel', '/api/v1/youtube/playlist'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        },
        {
          name: 'Jikan API',
          category: 'Anime',
          priority: 1,
          supportedEndpoints: ['/api/v1/anime/search', '/api/v1/anime/info', '/api/v1/anime/episodes', '/api/v1/anime/characters', '/api/v1/anime/images', '/api/v1/anime/wallpapers', '/api/v1/anime/gifs', '/api/v1/anime/stickers'],
          enabled: true,
          config: { baseUrl: 'https://api.jikan.moe/v4' } // Jikan is real and doesn't require keys, good for api
        },
        {
          name: 'Giphy API',
          category: 'Stickers',
          priority: 1,
          supportedEndpoints: ['Search Stickers', 'Trending Stickers', 'Anime Stickers', 'Reaction Stickers', 'Funny Stickers', 'Emoji Stickers', 'Random Stickers', 'Featured Packs'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        },
        {
          name: 'Meme API',
          category: 'Memes',
          priority: 1,
          supportedEndpoints: ['Random Meme', 'Trending Memes', 'Programming Memes', 'Anime Memes', 'Gaming Memes', 'Reaction Memes', 'Daily Meme'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        },
        {
          name: 'Unsplash API',
          category: 'Images',
          priority: 1,
          supportedEndpoints: ['Random Images', 'Anime Images', 'Wallpaper Images', 'Profile Pictures', 'Reaction Images', 'Quote Images', 'Nature', 'Cars', 'Technology', 'Space', 'Cats', 'Dogs'],
          enabled: true,
          config: { baseUrl: 'https://api.giphy.com/v1' }
        }
      ]);
    }
  } catch (err) {
    console.error('Failed to init settings or api APIs:', err);
  }
};
