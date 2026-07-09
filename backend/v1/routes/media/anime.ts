import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

const getJikanUrl = (provider: any) => {
  let url = provider.config?.baseUrl || 'https://api.jikan.moe/v4';
  
  return url;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Jikan API has rate limits (3 requests per second, 60 requests per minute)
// To be safe, we don't necessarily need delay here as rate limiter is on gateway, but it helps.

// /api/v1/anime/search
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const result = await ProviderEngine.execute({
      category: 'Anime',
      endpoint: '/api/v1/anime/search',
      params: { query },
      cacheTtl: 86400, // 1 day
      executeParams: async (provider) => {
        const baseUrl = getJikanUrl(provider);
        const resp = await fetch(`${baseUrl}/anime?q=${encodeURIComponent(query as string)}&limit=10`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        return data.data.map((item: any) => ({
          id: item.mal_id,
          title: item.title,
          title_english: item.title_english,
          episodes: item.episodes,
          status: item.status,
          score: item.score,
          image: item.images?.jpg?.image_url,
          genres: item.genres?.map((g:any) => g.name)
        }));
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/anime/info
router.get('/info', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    const result = await ProviderEngine.execute({
      category: 'Anime',
      endpoint: '/api/v1/anime/info',
      params: { id },
      cacheTtl: 86400,
      executeParams: async (provider) => {
        const baseUrl = getJikanUrl(provider);
        const resp = await fetch(`${baseUrl}/anime/${id}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        const item = data.data;

        return {
          id: item.mal_id,
          title: item.title,
          description: item.synopsis,
          episodes: item.episodes,
          status: item.status,
          score: item.score,
          image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          genres: item.genres?.map((g:any) => g.name),
          studios: item.studios?.map((s:any) => s.name),
          source: item.source
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/anime/characters
router.get('/characters', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    const result = await ProviderEngine.execute({
      category: 'Anime',
      endpoint: '/api/v1/anime/characters',
      params: { id },
      cacheTtl: 86400,
      executeParams: async (provider) => {
        const baseUrl = getJikanUrl(provider);
        const resp = await fetch(`${baseUrl}/anime/${id}/characters`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        return data.data.slice(0, 20).map((c: any) => ({
          id: c.character.mal_id,
          name: c.character.name,
          role: c.role,
          image: c.character.images?.jpg?.image_url
        }));
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/anime/images
router.get('/images', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    const result = await ProviderEngine.execute({
      category: 'Anime',
      endpoint: '/api/v1/anime/images',
      params: { id },
      cacheTtl: 86400,
      executeParams: async (provider) => {
        const baseUrl = getJikanUrl(provider);
        const resp = await fetch(`${baseUrl}/anime/${id}/pictures`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        return data.data.map((img: any) => img.jpg.large_image_url || img.jpg.image_url);
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/anime/episodes
router.get('/episodes', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

    const result = await ProviderEngine.execute({
      category: 'Anime',
      endpoint: '/api/v1/anime/episodes',
      params: { id },
      cacheTtl: 86400,
      executeParams: async (provider) => {
        const baseUrl = getJikanUrl(provider);
        const resp = await fetch(`${baseUrl}/anime/${id}/episodes`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        return data.data.map((ep: any) => ({
          id: ep.mal_id,
          title: ep.title,
          aired: ep.aired,
          score: ep.score
        }));
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
