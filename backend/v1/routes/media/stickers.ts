import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const result = await ProviderEngine.execute({
      category: 'Stickers',
      endpoint: '/api/v1/stickers/search',
      params: { query },
      cacheTtl: 3600,
      executeParams: async (provider) => {
        // Giphy public beta key
        const resp = await fetch(`https://api.giphy.com/v1/stickers/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query as string)}&limit=10`);
        if (!resp.ok) throw new Error('Provider HTTP Error');
        const data = await resp.json();
        return data.data.map((item: any) => ({
          id: item.id,
          url: item.images.fixed_height.url,
          name: item.title
        }));
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
