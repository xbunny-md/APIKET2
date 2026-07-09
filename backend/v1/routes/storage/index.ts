import { Router } from 'express';
import { MediaStorage, Message, Provider } from '../../../models/index.js';
import { apiGateway } from '../../../middleware/gateway.js';
import { authenticateToken, requireAdmin } from '../../../middleware/auth.js';

const router = Router();

// Storage message endpoint
router.post('/message', apiGateway, async (req, res) => {
  try {
    const { content, metadata } = req.body;
    if (!content) throw new Error('Content is required');
    const msg = await Message.create({
      userId: (req as any).user?.userId,
      content,
      metadata
    });
    res.success(msg);
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/message/:id', apiGateway, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) throw new Error('Not found');
    res.success(msg);
  } catch (err: any) {
    res.error(500, err.message);
  }
});

// Admin endpoints
router.get('/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalMedia = await MediaStorage.countDocuments();
    const totalMessages = await Message.countDocuments();
    res.success({ totalMedia, totalMessages, status: 'healthy' });
  } catch (err: any) {
    res.error(500, err.message);
  }
});

router.get('/providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const providers = await Provider.find({ category: 'Upload' }).sort({ priority: 1 });
    res.success(providers);
  } catch (err: any) {
    res.error(500, err.message);
  }
});

export default router;
