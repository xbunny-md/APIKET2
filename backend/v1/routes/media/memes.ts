import { Router } from 'express';
import { ProviderEngine } from '../../../core/providerEngine.js';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.get('/random', async (req, res) => {
  try {
    const result = await ProviderEngine.execute({
      category: 'Memes',
      endpoint: '/api/v1/memes/random',
      params: {},
      cacheTtl: 0,
      executeParams: async (provider) => {
        const resp = await fetch('https://meme-api.com/gimme');
        if (!resp.ok) throw new Error('Provider HTTP Error');
        const data = await resp.json();
        return {
          title: data.title,
          image: data.url,
          source: `Reddit - r/${data.subreddit}`,
          upvotes: data.ups
        };
      }
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
