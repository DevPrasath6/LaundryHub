import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (err: ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode: number) => ApiError;
//# sourceMappingURL=errorHandler.d.ts.map