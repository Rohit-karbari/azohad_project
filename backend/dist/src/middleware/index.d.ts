import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
        }
    }
}
export declare function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function errorHandlerMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=index.d.ts.map