import { Knex } from 'knex';
import { AuditLog } from '../entities';

export class AuditLogRepository {
  constructor(private knex: Knex) {}

  async create(auditLog: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [result] = await this.knex('audit_logs')
      .insert({
        user_id: auditLog.userId,
        user_type: auditLog.userType,
        action: auditLog.action,
        resource_type: auditLog.resourceType,
        resource_id: auditLog.resourceId,
        old_values: auditLog.oldValues,
        new_values: auditLog.newValues,
        ip_address: auditLog.ipAddress,
        correlation_id: auditLog.correlationId,
        description: auditLog.description,
        status: auditLog.status,
      })
      .returning('*');

    return this.mapToEntity(result);
  }

  async findByResourceType(resourceType: string, limit: number = 50): Promise<AuditLog[]> {
    const results = await this.knex('audit_logs')
      .where({ resource_type: resourceType })
      .orderBy('created_at', 'desc')
      .limit(limit);

    return results.map((r) => this.mapToEntity(r));
  }

  async findByUserId(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const results = await this.knex('audit_logs')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);

    return results.map((r) => this.mapToEntity(r));
  }

  async findByCorrelationId(correlationId: string): Promise<AuditLog[]> {
    const results = await this.knex('audit_logs')
      .where({ correlation_id: correlationId })
      .orderBy('created_at', 'asc');

    return results.map((r) => this.mapToEntity(r));
  }

  private mapToEntity(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      userType: row.user_type,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      oldValues: row.old_values,
      newValues: row.new_values,
      ipAddress: row.ip_address,
      correlationId: row.correlation_id,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
