import { Router } from 'express';
import { GoogleKey } from '../../../models/index.js';
import { apiGateway } from '../../../middleware/gateway.js';
import { authenticateToken, requireAdmin } from '../../../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const keys = await GoogleKey.find().sort({ priority: -1 });
    res.success(keys);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.post('/keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = await GoogleKey.create(req.body);
    res.success(key);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.put('/keys/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const key = await GoogleKey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.success(key);
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.delete('/keys/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await GoogleKey.findByIdAndDelete(req.params.id);
    res.success({ deleted: true });
  } catch (error: any) {
    res.error(500, error.message);
  }
});

router.get('/status', async (req, res) => {
  try {
    const count = await GoogleKey.countDocuments({ status: 'active' });
    res.success({ activeKeys: count, status: count > 0 ? 'healthy' : 'offline' });
  } catch (error: any) {
    res.error(500, error.message);
  }
});

export default router;
