import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiKey } from '../../../models/index.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router = Router();

// Get all API keys for the current user
router.get('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.userId }).select('-keyHash').sort({ createdAt: -1 });
    res.success(keys);
  } catch (error) {
    next(error);
  }
});

// Create a new API key
router.post('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { name } = req.body;
    
    // Generate exactly 50 chars. nx_ + 47 random hex chars
    const randomBytes = crypto.randomBytes(24).toString('hex'); // 48 chars
    const rawKey = 'nx_' + randomBytes.substring(0, 47); // exactly 50 chars
    
    const keyPrefix = rawKey.substring(0, 8);
    const salt = await bcrypt.genSalt(10);
    const keyHash = await bcrypt.hash(rawKey, salt);
    
    const apiKey = await ApiKey.create({
      userId: req.user.userId,
      keyPrefix,
      keyHash,
      name: name || 'Default Key',
      status: 'active'
    });
    
    // Return the raw key ONLY ONCE
    const result = apiKey.toObject();
    delete result.keyHash;
    result.plainKey = rawKey;
    
    res.success(result, 'API Key created successfully');
  } catch (error) {
    next(error);
  }
});

// Update API key (rename, disable, enable)
router.patch('/:id', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    const apiKey = await ApiKey.findOne({ _id: id, userId: req.user.userId });
    if (!apiKey) return res.error(404, 'API Key not found');
    
    if (name) apiKey.name = name;
    if (status && ['active', 'disabled', 'revoked'].includes(status)) {
      apiKey.status = status;
    }
    
    await apiKey.save();
    
    const result = apiKey.toObject();
    delete result.keyHash;
    res.success(result, 'API Key updated');
  } catch (error) {
    next(error);
  }
});

// Delete API key
router.delete('/:id', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findOneAndDelete({ _id: id, userId: req.user.userId });
    
    if (!apiKey) return res.error(404, 'API Key not found');
    
    res.success({}, 'API Key deleted');
  } catch (error) {
    next(error);
  }
});

// Regenerate API key
router.post('/:id/regenerate', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findOne({ _id: id, userId: req.user.userId });
    
    if (!apiKey) return res.error(404, 'API Key not found');
    
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = 'nx_' + randomBytes.substring(0, 47);
    
    apiKey.keyPrefix = rawKey.substring(0, 8);
    const salt = await bcrypt.genSalt(10);
    apiKey.keyHash = await bcrypt.hash(rawKey, salt);
    apiKey.lastUsedAt = null;
    apiKey.requestCount = 0;
    
    await apiKey.save();
    
    const result = apiKey.toObject();
    delete result.keyHash;
    result.plainKey = rawKey;
    
    res.success(result, 'API Key regenerated');
  } catch (error) {
    next(error);
  }
});

export default router;
