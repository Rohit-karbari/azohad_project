"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const logging_1 = require("../logging");
class AuditLogger {
    constructor(knex) {
        this.knex = knex;
    }
    async log(userId, userType, action, resourceType, resourceId, description, oldValues, newValues, ipAddress, correlationId, status) {
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
            logging_1.logger.info('Audit log recorded', {
                userId,
                action,
                resourceType,
                status,
                correlationId,
            });
        }
        catch (error) {
            logging_1.logger.error('Failed to record audit log', {
                error: error.message,
                userId,
                action,
            });
        }
    }
    async getByResourceType(resourceType, limit = 50) {
        const results = await this.knex('audit_logs')
            .where({ resource_type: resourceType })
            .orderBy('created_at', 'desc')
            .limit(limit);
        return results.map((r) => this.mapToEntity(r));
    }
    async getByUserId(userId, limit = 50) {
        const results = await this.knex('audit_logs')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc')
            .limit(limit);
        return results.map((r) => this.mapToEntity(r));
    }
    mapToEntity(row) {
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
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=audit-logger.js.map