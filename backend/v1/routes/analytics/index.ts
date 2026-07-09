import { Router } from 'express';
import { RequestHistory, UsageAnalytics, ApiKey } from '../../../models/index.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router = Router();

// Get usage summary (Dashboard Overview)
router.get('/summary', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    
    // Total requests ever
    const totalRequests = await RequestHistory.countDocuments({ userId });
    
    // Today's requests
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRequests = await RequestHistory.countDocuments({ userId, timestamp: { $gte: startOfToday } });
    
    // Active API Keys
    const activeKeys = await ApiKey.countDocuments({ userId, status: 'active' });
    
    // Errors (status >= 400)
    const errorRequests = await RequestHistory.countDocuments({ userId, statusCode: { $gte: 400 } });
    
    const successRate = totalRequests > 0 ? (((totalRequests - errorRequests) / totalRequests) * 100).toFixed(2) : 100;
    
    // Placeholder quota values since we haven't built the subscription engine fully
    res.success({
      totalRequests,
      todayRequests,
      activeKeys,
      successRate: parseFloat(successRate as string),
      errorRate: parseFloat((100 - (successRate as any)).toFixed(2)),
      remainingRequests: 2000 - todayRequests,
      currentPlan: 'Free Tier'
    });
  } catch (error) {
    next(error);
  }
});

// Get charts data
router.get('/charts', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    
    // Get last 7 days of request history grouped by day
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const history = await RequestHistory.aggregate([
      { $match: { userId, timestamp: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, 
          requests: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } }
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.success(history);
  } catch (error) {
    next(error);
  }
});

// Get recent requests
router.get('/requests', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const requests = await RequestHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('apiId', 'name')
      .populate('apiKeyId', 'name keyPrefix');
      
    res.success(requests);
  } catch (error) {
    next(error);
  }
});

export default router;
