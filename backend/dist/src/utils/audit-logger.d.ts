import { Knex } from 'knex';
import { AuditLog } from '../entities';
export declare class AuditLogger {
    private knex;
    constructor(knex: Knex);
    log(userId: string, userType: 'patient' | 'doctor' | 'admin', action: string, resourceType: string, resourceId: string | undefined, description: string, oldValues: Record<string, any> | undefined, newValues: Record<string, any> | undefined, ipAddress: string | undefined, correlationId: string | undefined, status: 'success' | 'failure'): Promise<void>;
    getByResourceType(resourceType: string, limit?: number): Promise<AuditLog[]>;
    getByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
    private mapToEntity;
}
//# sourceMappingURL=audit-logger.d.ts.map