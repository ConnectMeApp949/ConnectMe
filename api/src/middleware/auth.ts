import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../lib/tokens';
import { sendError } from '../lib/errors';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    sendError(res, {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header',
    });
    return;
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendError(res, {
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired',
      });
      return;
    }
    sendError(res, {
      status: 401,
      code: 'INVALID_TOKEN',
      message: 'Invalid access token',
    });
  }
}
