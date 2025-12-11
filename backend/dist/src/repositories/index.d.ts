import { Knex } from 'knex';
import { AuditLog } from '../entities';
export declare class AuditLogRepository {
    private knex;
    constructor(knex: Knex);
    create(auditLog: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
    findByResourceType(resourceType: string, limit?: number): Promise<AuditLog[]>;
    findByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
    findByCorrelationId(correlationId: string): Promise<AuditLog[]>;
    private mapToEntity;
}
//# sourceMappingURL=index.d.ts.map