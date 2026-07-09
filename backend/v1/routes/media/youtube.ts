import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';
import { GoogleKey } from '../../../models/index.js';

const router = Router();
router.use(apiGateway);

const getPipedUrl = (provider: any) => {
  let url = provider.config?.baseUrl || 'https://pipedapi.kavin.rocks';
  
  return url;
};

const extractVideoId = (url: string) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
  return match ? match[1] : null;
};

// /api/v1/youtube/search
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/search',
      params: { query },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        if (provider.name === 'Google API Key Fallback') {
           const googleKey = await GoogleKey.findOne({ 
             status: 'active',
             healthScore: { $gt: 20 }
           }).sort({ priority: -1, healthScore: -1 });
           
           if (!googleKey) throw new Error('No active or healthy Google Cloud API Keys available');
           
           try {
             const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query as string)}&type=video&maxResults=10&key=${googleKey.key}`);
             const data = await resp.json();
             
             if (!resp.ok) {
                 if (resp.status === 403 || resp.status === 429) {
                     googleKey.status = 'exhausted';
                     googleKey.healthScore = 0;
                 } else {
                     googleKey.failureCount = (googleKey.failureCount || 0) + 1;
                     googleKey.healthScore = Math.max(0, googleKey.healthScore - 10);
                 }
                 await googleKey.save();
                 throw new Error(data.error?.message || `Provider HTTP Error: ${resp.status}`);
             }
             
             if (data.error) throw new Error(data.error.message);
             
             googleKey.usageCount = (googleKey.usageCount || 0) + 1;
             googleKey.lastUsedAt = new Date();
             googleKey.healthScore = Math.min(100, googleKey.healthScore + 2); // Recover health on success
             await googleKey.save();
             
             return data.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
             }));
           } catch (err: any) {
             throw err;
           }
        }

        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query as string)}&filter=videos`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        return data.items.slice(0, 10).map((item: any) => ({
          id: item.url.replace('/watch?v=', ''),
          title: item.title,
          channel: item.uploaderName,
          views: item.views,
          thumbnail: item.thumbnail,
          duration: item.duration
        }));
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/youtube/info
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const videoId = extractVideoId(url as string) || url;

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/info',
      params: { videoId },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/streams/${videoId}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        if (data.error) throw new Error(data.error);

        return {
          id: videoId,
          title: data.title,
          channel: data.uploader,
          views: data.views,
          likes: data.likes,
          duration: data.duration,
          thumbnail: data.thumbnailUrl,
          description: data.description
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/youtube/audio
router.get('/audio', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const videoId = extractVideoId(url as string) || url;

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/audio',
      params: { videoId },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/streams/${videoId}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        if (data.error) throw new Error(data.error);
        
        // Extract audio streams
        const audioStreams = data.audioStreams || [];
        const bestAudio = audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

        return {
          id: videoId,
          title: data.title,
          channel: data.uploader,
          url: bestAudio?.url || null,
          bitrate: bestAudio?.bitrate || null,
          format: bestAudio?.mimeType || null,
          duration: data.duration
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/youtube/video
router.get('/video', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const videoId = extractVideoId(url as string) || url;

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/video',
      params: { videoId },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/streams/${videoId}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        if (data.error) throw new Error(data.error);
        
        // Extract video streams
        const videoStreams = data.videoStreams || [];
        // Filter out video-only streams (we want video+audio if possible, or just the stream)
        const bestVideo = videoStreams.filter((s:any) => s.videoOnly === false).sort((a: any, b: any) => b.bitrate - a.bitrate)[0] || videoStreams[0];

        return {
          id: videoId,
          title: data.title,
          channel: data.uploader,
          url: bestVideo?.url || null,
          quality: bestVideo?.quality || null,
          format: bestVideo?.mimeType || null,
          duration: data.duration
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/youtube/channel
router.get('/channel', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'Channel ID or URL is required' });

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/channel',
      params: { id },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/channel/${id}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        if (data.error) throw new Error(data.error);

        return {
          id: data.id,
          name: data.name,
          avatar: data.avatarUrl,
          banner: data.bannerUrl,
          subscribers: data.subscriberCount,
          description: data.description
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// /api/v1/youtube/playlist
router.get('/playlist', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'Playlist ID is required' });

    const result = await ProviderEngine.execute({
      category: 'YouTube',
      endpoint: '/api/v1/youtube/playlist',
      params: { id },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        const baseUrl = getPipedUrl(provider);
        const resp = await fetch(`${baseUrl}/playlists/${id}`);
        if (!resp.ok) throw new Error(`Provider HTTP Error: ${resp.status}`);
        const data = await resp.json();
        
        if (data.error) throw new Error(data.error);

        return {
          id: data.id,
          name: data.name,
          thumbnail: data.thumbnailUrl,
          videos: data.relatedStreams?.slice(0, 50).map((v:any) => ({
            id: v.url.replace('/watch?v=', ''),
            title: v.title,
            duration: v.duration,
            thumbnail: v.thumbnail
          }))
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
