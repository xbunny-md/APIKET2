import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.get('/random', async (req, res) => {
  try {
    const result = await ProviderEngine.execute({
      category: 'Images',
      endpoint: '/api/v1/images/random',
      params: {},
      cacheTtl: 0,
      executeParams: async (provider) => {
        const randomPage = Math.floor(Math.random() * 100) + 1;
        const resp = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=1`);
        if (!resp.ok) throw new Error('Provider HTTP Error');
        const data = await resp.json();
        const item = data[0];
        return {
          url: item.download_url,
          author: item.author,
          width: item.width,
          height: item.height
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
