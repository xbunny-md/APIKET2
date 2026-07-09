import { Request, Response, NextFunction } from 'express';
import { RequestLog } from '../models/index.js';
import { getSetting } from '../core/settings.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // We hook into the response finish event
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    // In serverless, writing to DB asynchronously after response is sent might fail if function freezes.
    // However, for typical express running on Vercel it usually waits for the event loop, 
    // but better to await if possible, though we can't await in `res.on('finish')`.
    // It's acceptable for best-effort logging.
    try {
      const deviceHash = req.cookies?.deviceHash || (req.headers['x-device-hash'] as string) || undefined;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      
      await RequestLog.create({
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: duration,
        userId: (req as any).user?.userId,
        ip,
        deviceHash
      });
      
    } catch (err) {
      console.error('Failed to log request', err);
    }
  });

  next();
};
