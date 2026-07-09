import { Router } from 'express';
import { apiGateway } from '../../../middleware/gateway.js';
import { GoogleGenAI } from '@google/genai';

const router = Router();
router.use(apiGateway);

router.post('/summarize', async (req, res) => {
  try {
    const { text, length = 'short' } = req.body;
    if (!text) return res.error(400, 'text is required');
    
    if (!process.env.GEMINI_API_KEY) {
      return res.error(503, 'Gemini API Key is not configured on the server.');
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text in a ${length} format:\n\n${text}`,
    });
    
    res.success({ summary: response.text }, { provider: 'Google Gemini', cached: false });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, to = 'es', from = 'auto' } = req.body;
    if (!text) return res.error(400, 'text is required');
    
    // Using a public free translation API as primary to avoid relying solely on Gemini key
    const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const data = await resp.json();
    
    if (data.responseStatus === 200) {
      res.success({ translatedText: data.responseData.translatedText }, { provider: 'mymemory.translated.net', cached: false });
    } else {
      res.error(500, data.responseDetails || 'Translation failed');
    }
  } catch (err: any) {
    res.error(500, err.message);
  }
});

export default router;
