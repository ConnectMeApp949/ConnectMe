import { Response } from 'express';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: { field: string; message: string }[];
}

export function sendError(res: Response, error: ApiError): void {
  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
    },
  });
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: PaginationMeta): void {
  res.status(status).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}
