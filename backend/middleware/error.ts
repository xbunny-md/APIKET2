import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err.stack || err);
  
  if (err.name === 'ValidationError') {
    return res.error(400, err.message);
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.error(400, 'Invalid JSON payload');
  }

  res.error(500, 'Internal Server Error');
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.error(404, 'Endpoint not found');
};
