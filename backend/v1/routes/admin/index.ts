import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSetting, updateSetting } from '../../../core/settings.js';
import { Provider, ApiCatalog, ApiDocumentation, ApiEndpoint, User, ApiKey, UsageAnalytics, RequestLog, SystemLog } from '../../../models/index.js';

const router = Router();

// API Catalog & Endpoints Builder
router.get('/apis', async (req: any, res: any, next: any) => {
  try {
    const apis = await ApiCatalog.find().lean();
    res.success(apis);
  } catch (error) { next(error); }
});

router.post('/apis', async (req: any, res: any, next: any) => {
  try {
    const newApi = await ApiCatalog.create(req.body);
    await SystemLog.create({ level: 'info', message: `Admin created API: ${newApi.name}`, meta: { apiId: newApi._id } });
    res.success(newApi);
  } catch (error) { next(error); }
});

router.put('/apis/:id', async (req: any, res: any, next: any) => {
  try {
    const api = await ApiCatalog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.success(api);
  } catch (error) { next(error); }
});

router.delete('/apis/:id', async (req: any, res: any, next: any) => {
  try {
    await ApiCatalog.findByIdAndDelete(req.params.id);
    await ApiDocumentation.deleteMany({ apiId: req.params.id });
    await ApiEndpoint.deleteMany({ apiId: req.params.id });
    await SystemLog.create({ level: 'info', message: `Admin deleted API: ${req.params.id}` });
    res.success({ success: true });
  } catch (error) { next(error); }
});

// Endpoint Builder
router.get('/apis/:id/endpoints', async (req: any, res: any, next: any) => {
  try {
    const endpoints = await ApiEndpoint.find({ apiId: req.params.id }).lean();
    res.success(endpoints);
  } catch (error) { next(error); }
});

router.post('/apis/:id/endpoints', async (req: any, res: any, next: any) => {
  try {
    const ep = await ApiEndpoint.create({ ...req.body, apiId: req.params.id });
    // Also create legacy ApiDocumentation for backward compatibility with the existing UI
    await ApiDocumentation.findOneAndUpdate(
      { apiId: req.params.id }, 
      { 
        method: ep.method, 
        parameters: ep.parameters, 
        headers: ep.headers,
        body: ep.body,
        responseSuccess: ep.responseSuccess
      }, 
      { upsert: true }
    );
    // And update the ApiCatalog endpoint to match the first endpoint
    await ApiCatalog.findByIdAndUpdate(req.params.id, { endpoint: ep.route });
    res.success(ep);
  } catch (error) { next(error); }
});

router.put('/endpoints/:id', async (req: any, res: any, next: any) => {
  try {
    const ep = await ApiEndpoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.success(ep);
  } catch (error) { next(error); }
});

router.delete('/endpoints/:id', async (req: any, res: any, next: any) => {
  try {
    await ApiEndpoint.findByIdAndDelete(req.params.id);
    res.success({ success: true });
  } catch (error) { next(error); }
});

// Providers
router.get('/providers', async (req: any, res: any, next: any) => {
  try {
    const providers = await Provider.find().sort({ category: 1, priority: -1 });
    res.success(providers);
  } catch (error) { next(error); }
});

router.post('/providers', async (req: any, res: any, next: any) => {
  try {
    const provider = await Provider.create(req.body);
    res.success(provider);
  } catch (error) { next(error); }
});

router.patch('/providers/:id', async (req: any, res: any, next: any) => {
  try {
    const updated = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.success(updated);
  } catch (error) { next(error); }
});

router.delete('/providers/:id', async (req: any, res: any, next: any) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.success({ success: true });
  } catch (error) { next(error); }
});

// Users
router.get('/users', async (req: any, res: any, next: any) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.success(users);
  } catch (error) { next(error); }
});

router.put('/users/:id', async (req: any, res: any, next: any) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    res.success(user);
  } catch (error) { next(error); }
});

// API Keys
router.get('/keys', async (req: any, res: any, next: any) => {
  try {
    const keys = await ApiKey.find().populate('userId', 'email');
    res.success(keys);
  } catch (error) { next(error); }
});

// Analytics Dashboard Data
router.get('/analytics/overview', async (req: any, res: any, next: any) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalApiKeys = await ApiKey.countDocuments();
    const activeApiKeys = await ApiKey.countDocuments({ status: 'active' });
    const totalApis = await ApiCatalog.countDocuments();
    const totalEndpoints = await ApiEndpoint.countDocuments();
    
    // Fallback if ApiEndpoint doesn't exist yet
    const finalTotalEndpoints = totalEndpoints > 0 ? totalEndpoints : totalApis;
    
    const todayRequests = await RequestLog.countDocuments({ timestamp: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
    const degradedProviders = await Provider.countDocuments({ status: { $ne: 'healthy' } });
    
    res.success({
      totalUsers,
      activeUsers,
      totalApiKeys,
      activeApiKeys,
      totalApis,
      totalEndpoints: finalTotalEndpoints,
      todayRequests,
      degradedProviders
    });
  } catch (error) { next(error); }
});

export default router;

// Plans
router.get('/plans', async (req: any, res: any, next: any) => {
  try {
    // import Plan from models dynamically if needed, or we already have it exported from models.
    const { Plan } = await import('../../../models/index.js');
    const plans = await Plan.find();
    res.success(plans);
  } catch (error) { next(error); }
});

router.post('/plans', async (req: any, res: any, next: any) => {
  try {
    const { Plan } = await import('../../../models/index.js');
    const plan = await Plan.create(req.body);
    res.success(plan);
  } catch (error) { next(error); }
});

router.put('/plans/:id', async (req: any, res: any, next: any) => {
  try {
    const { Plan } = await import('../../../models/index.js');
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.success(plan);
  } catch (error) { next(error); }
});

router.delete('/plans/:id', async (req: any, res: any, next: any) => {
  try {
    const { Plan } = await import('../../../models/index.js');
    await Plan.findByIdAndDelete(req.params.id);
    res.success({ success: true });
  } catch (error) { next(error); }
});
