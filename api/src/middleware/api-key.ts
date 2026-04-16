import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates the x-api-key header.
 * Skips validation if API_KEY is not set (development mode).
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.API_KEY;

  // Skip in development or if no key is configured
  if (!expectedKey) {
    return next();
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or missing API key' },
    });
  }

  next();
}
