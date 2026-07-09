import { Request, Response, NextFunction } from 'express';
import { ApiKey, UsageAnalytics, User, Plan, UserQuota } from '../models/index.js';
import { incrementStat } from '../core/stats.js';

export const apiGateway = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.error(401, 'Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  if (!token.startsWith('nx_')) {
    return res.error(401, 'Invalid API Key format');
  }

  try {
    const keyPrefix = token.substring(0, 8);
    const apiKeys = await ApiKey.find({ keyPrefix, status: 'active' });
    
    if (apiKeys.length === 0) {
      return res.error(401, 'Invalid or disabled API Key');
    }

    let validKey = null;
    const bcrypt = await import('bcryptjs');
    
    for (const apiKey of apiKeys) {
      if (await bcrypt.default.compare(token, apiKey.keyHash)) {
        validKey = apiKey;
        break;
      }
    }

    if (!validKey) {
      return res.error(401, 'Invalid API Key');
    }
    
    if (validKey.expiresAt && validKey.expiresAt < new Date()) {
      validKey.status = 'expired';
      await validKey.save();
      return res.error(403, 'API Key expired');
    }

    const user = await User.findById(validKey.userId).populate('planId');
    if (!user) {
       return res.error(401, 'User associated with this key not found');
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const minuteStr = `${dateStr}T${now.getHours()}:${now.getMinutes()}`;
    const secondStr = `${minuteStr}:${now.getSeconds()}`;
    
    let dailyLimit = 1000;
    let minuteLimit = 60;
    let secondLimit = 5;

    if (user.planId) {
        dailyLimit = user.planId.dailyQuota;
        minuteLimit = user.planId.requestsPerMinute;
        secondLimit = user.planId.requestsPerSecond || 5;
    }

    const quota = await UserQuota.findOne({ userId: user._id, date: dateStr }) || new UserQuota({ userId: user._id, date: dateStr });
    
    if (quota.requestsCount >= dailyLimit) return res.error(429, 'Daily quota exceeded');
    
    if (quota.currentMinute !== minuteStr) {
        quota.currentMinute = minuteStr;
        quota.minuteRequests = 0;
    }
    if (quota.minuteRequests >= minuteLimit) return res.error(429, 'Rate limit exceeded (Per minute)');
    
    if (quota.currentSecond !== secondStr) {
        quota.currentSecond = secondStr;
        quota.secondRequests = 0;
    }
    if (quota.secondRequests >= secondLimit) return res.error(429, 'Rate limit exceeded (Per second)');
    
    quota.requestsCount += 1;
    quota.minuteRequests += 1;
    quota.secondRequests += 1;
    await quota.save();

    validKey.lastUsedAt = now;
    validKey.requestCount += 1;
    await validKey.save();
    
    await incrementStat('totalRequests');
    await incrementStat('todayRequests');
    
    (req as any).apiKey = validKey;
    (req as any).user = { userId: validKey.userId };
    
    UsageAnalytics.create({
      userId: validKey.userId,
      apiKeyId: validKey._id,
      timestamp: now,
      requests: 1
    }).catch(console.error);

    next();
  } catch (err) {
    console.error('Gateway Error:', err);
    res.error(500, 'Gateway Error');
  }
};
