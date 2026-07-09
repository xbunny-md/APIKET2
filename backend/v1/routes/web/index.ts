import { Router } from 'express';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.post('/screenshot', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.error(400, 'url is required');
    
    const resp = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`);
    const data = await resp.json();
    
    if (data.status === 'success') {
      res.success({ screenshot: data.data.screenshot.url }, { provider: 'microlink.io', cached: false });
    } else {
      res.error(500, data.message || 'Failed to capture screenshot');
    }
  } catch (err: any) {
    res.error(500, err.message);
  }
});

export default router;
