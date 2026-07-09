import { Request, Response, NextFunction } from 'express';

// Extend Express Response type to include our custom methods
declare global {
  namespace Express {
    interface Response {
      success: (data?: any, metaOrMessage?: any) => void;
      error: (code: number, message: string, meta?: any) => void;
    }
  }
}

export const responseEngine = (req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any = {}, metaOrMessage: any = '') => {
    let message = typeof metaOrMessage === 'string' ? metaOrMessage : '';
    res.json({
      success: true,
      data,
      message
    });
  };

  res.error = (code: number, message: string, meta: any = {}) => {
    res.status(code).json({
      success: false,
      error: {
        code,
        message
      }
    });
  };

  next();
};
