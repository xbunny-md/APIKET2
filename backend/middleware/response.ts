import { Request, Response, NextFunction } from 'express';

// Extend Express Response type to include our custom methods
declare global {
  namespace Express {
    interface Response {
      success: (data?: any, message?: string) => void;
      error: (code: number, message: string) => void;
    }
  }
}

export const responseEngine = (req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any = {}, message: string = '') => {
    res.json({
      success: true,
      data,
      message
    });
  };

  res.error = (code: number, message: string) => {
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
