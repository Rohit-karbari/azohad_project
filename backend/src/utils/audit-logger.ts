import { Knex } from 'knex';
import { AuditLog } from '../entities';
import { logger } from '../logging';

export class AuditLogger {
  constructor(private knex: Knex) {}

  async log(
    userId: string,
    userType: 'patient' | 'doctor' | 'admin',
    action: string,
    resourceType: string,
    resourceId: string | undefined,
    description: string,
    oldValues: Record<string, any> | undefined,
    newValues: Record<string, any> | undefined,
    ipAddress: string | undefined,
    correlationId: string | undefined,
    status: 'success' | 'failure',
  ): Promise<void> {
    try {
      await this.knex('audit_logs').insert({
        user_id: userId,
        user_type: userType,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        correlation_id: correlationId,
        description,
        status,
      });

      logger.info('Audit log recorded', {
        userId,
        action,
        resourceType,
        status,
        correlationId,
      });
    } catch (error) {
      logger.error('Failed to record audit log', {
        error: (error as Error).message,
        userId,
        action,
      });
    }
  }

  async getByResourceType(resourceType: string, limit: number = 50): Promise<AuditLog[]> {
    const results = await this.knex('audit_logs')
      .where({ resource_type: resourceType })
      .orderBy('created_at', 'desc')
      .limit(limit);

    return results.map((r: any) => this.mapToEntity(r));
  }

  async getByUserId(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const results = await this.knex('audit_logs')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);

    return results.map((r: any) => this.mapToEntity(r));
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
