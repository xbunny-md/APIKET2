import { Router } from 'express';
import { apiGateway } from '../../../middleware/gateway.js';

const router = Router();
router.use(apiGateway);

router.get('/crypto/price', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string)?.toUpperCase() || 'BTCUSDT';
    
    const resp = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await resp.json();
    
    if (data.msg) throw new Error(data.msg);
    
    res.success({ symbol: data.symbol, price: data.price }, { provider: 'Binance', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/weather/current', async (req, res) => {
  try {
    const lat = req.query.lat || '51.5085';
    const lon = req.query.lon || '-0.1257';
    
    const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const data = await resp.json();
    
    if (data.error) throw new Error(data.reason);
    
    res.success({ weather: data.current_weather }, { provider: 'Open-Meteo', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/ip/location', async (req, res) => {
  try {
    const ip = req.query.ip || req.ip;
    
    // Fallback if local
    const ipToQuery = (ip === '::1' || ip === '127.0.0.1') ? '' : ip;
    
    const resp = await fetch(`http://ip-api.com/json/${ipToQuery}`);
    const data = await resp.json();
    
    if (data.status === 'fail') throw new Error(data.message);
    
    res.success({ location: data }, { provider: 'ip-api.com', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/news/latest', async (req, res) => {
  try {
    const resp = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/us.json');
    const data = await resp.json();
    
    res.success({ articles: data.articles.slice(0, 10) }, { provider: 'NewsAPI (Saurav)', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.post('/email/verify', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.error(400, 'email is required');
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const formatValid = regex.test(email);
    
    res.success({ 
      email, 
      formatValid,
      isDisposable: false // simplified 
    }, { provider: 'local', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

export default router;
