import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

const extractVideoId = (url: string) => {
  const match = url.match(/\/video\/(\d+)/);
  if (match) return match[1];
  return null;
};

// Common TikWM Fetcher
const fetchTikWm = async (provider: any, url: string) => {
  const baseUrl = provider.config?.baseUrl || 'https://www.tikwm.com/api';
  const res = await fetch(`${baseUrl}/?url=${encodeURIComponent(url)}&hd=1`);
  if (!res.ok) throw new Error(`Provider HTTP Error: ${res.status}`);
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Provider Error: ${data.msg || 'Unknown error'}`);
  return data.data;
};

// /api/v1/tiktok/download
router.get('/download', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const result = await ProviderEngine.execute({
      category: 'TikTok',
      endpoint: '/api/v1/tiktok/download',
      params: { url },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const data = await fetchTikWm(provider, url as string);
        return {
          id: data.id,
          title: data.title,
          author: data.author?.unique_id,
          downloadUrls: {
            watermark: data.wmplay || null,
            no_watermark: data.play || null,
            no_watermark_hd: data.hdplay || null,
            audio: data.music || null
          }
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/tiktok/info
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const result = await ProviderEngine.execute({
      category: 'TikTok',
      endpoint: '/api/v1/tiktok/info',
      params: { url },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const data = await fetchTikWm(provider, url as string);
        return {
          id: data.id,
          title: data.title,
          author: {
            username: data.author?.unique_id,
            nickname: data.author?.nickname,
            avatar: data.author?.avatar
          },
          stats: {
            likes: data.digg_count,
            views: data.play_count,
            comments: data.comment_count,
            shares: data.share_count
          },
          duration: data.duration,
          cover: data.cover
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/tiktok/audio
router.get('/audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const result = await ProviderEngine.execute({
      category: 'TikTok',
      endpoint: '/api/v1/tiktok/audio',
      params: { url },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const data = await fetchTikWm(provider, url as string);
        return {
          id: data.music_info?.id || data.id,
          title: data.music_info?.title || 'Original Audio',
          author: data.music_info?.author || data.author?.nickname,
          url: data.music || null,
          duration: data.duration
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/tiktok/profile
router.get('/profile', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const result = await ProviderEngine.execute({
      category: 'TikTok',
      endpoint: '/api/v1/tiktok/profile',
      params: { username },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        // TikWM requires different endpoint for profile, but let's see if we can use search
        const baseUrl = provider.config?.baseUrl || 'https://www.tikwm.com/api';
        const u = String(username).replace('@', '');
        const res = await fetch(`${baseUrl}/user/info?unique_id=${u}`);
        const data = await res.json();
        if (data.code !== 0) throw new Error(data.msg || 'User not found');
        return data.data;
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/tiktok/images
router.get('/images', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const result = await ProviderEngine.execute({
      category: 'TikTok',
      endpoint: '/api/v1/tiktok/images',
      params: { url },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const data = await fetchTikWm(provider, url as string);
        if (!data.images || !Array.isArray(data.images)) {
          throw new Error('This post does not contain a slide of images');
        }
        return {
          id: data.id,
          title: data.title,
          images: data.images
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
