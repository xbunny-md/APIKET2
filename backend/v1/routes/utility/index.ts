import { Router } from 'express';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.post('/qr/generate', async (req, res) => {
  try {
    const { text, size = '200x200' } = req.body;
    if (!text) return res.error(400, 'text is required');
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(text)}`;
    
    res.success({ url: qrUrl }, { provider: 'qrserver.com', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.post('/url/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.error(400, 'url is required');
    
    const resp = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const data = await resp.json();
    
    if (data.errorcode) throw new Error(data.errormessage);
    
    res.success({ shorturl: data.shorturl }, { provider: 'is.gd', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.post('/password/generate', async (req, res) => {
  try {
    const { length = 16, numbers = true, symbols = true, uppercase = true } = req.body;
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    res.success({ password }, { provider: 'local', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/random/avatar', async (req, res) => {
  try {
    const seed = req.query.seed || Math.random().toString(36).substring(7);
    const style = req.query.style || 'bottts';
    
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed as string)}`;
    
    res.success({ url }, { provider: 'dicebear.com', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

export default router;
