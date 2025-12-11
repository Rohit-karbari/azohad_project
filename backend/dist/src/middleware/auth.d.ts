import { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    id: string;
    email: string;
    type: 'patient' | 'doctor';
}
export interface AuthRequest extends Request {
    user?: AuthPayload;
    correlationId?: string;
}
export declare function generateToken(payload: AuthPayload): string;
export declare function verifyToken(token: string): AuthPayload;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function rbacMiddleware(allowedRoles: ('patient' | 'doctor')[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map