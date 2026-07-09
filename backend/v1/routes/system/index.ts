import { Router } from 'express';
import mongoose from 'mongoose';
import { getSettings } from '../../../core/settings.js';
import { authenticateToken } from '../../../middleware/auth.js';
import { User } from '../../../models/index.js';

const router = Router();

// Health endpoint
router.get('/health', async (req: any, res: any, next: any) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };
    
    res.success({
      applicationStatus: 'online',
      mongoStatus: mongoStatusMap[mongoState as keyof typeof mongoStatusMap] || 'unknown',
      databaseStatus: mongoState === 1 ? 'healthy' : 'degraded',
      version: '1.1.1',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, 'System Health');
  } catch (error) {
    next(error);
  }
});

import { Provider } from '../../../models/index.js';

router.get('/providers', async (req: any, res: any, next: any) => {
  try {
    const providers = await Provider.find({ enabled: true }, 'name category status healthScore');
    res.success(providers, 'Available providers');
  } catch (error) {
    next(error);
  }
});

// Public configuration endpoint
router.get('/config', async (req: any, res: any, next: any) => {
  try {
    const settings = await getSettings();
    // Expose only safe settings to the public
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
      apiVersion: settings.apiVersion,
      theme: settings.theme,
      adminPath: settings.adminPath // Note: required by frontend for dynamic hidden admin path
    };
    
    res.success(publicSettings, 'System configuration');
  } catch (error) {
    next(error);
  }
});

// Current user profile
router.get('/user/me', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    if (req.user.admin) {
      return res.success({ role: 'admin' });
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.error(404, 'User not found');
    
    res.success(user);
  } catch (error) {
    next(error);
  }
});

export default router;
