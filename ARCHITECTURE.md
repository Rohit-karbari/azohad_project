# Architecture & Design Decisions

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│              API Layer (Express.js)                  │
│  Controllers → DTOs → Validation → Error Handling   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Service/Business Logic Layer               │
│  • Auth Service (registration, login)                │
│  • Patient Service (profile management)              │
│  • Appointment Service (scheduling)                  │
│  • Doctor Service (profile, specialization)          │
│  • Clinical Note Service (HIPAA-compliant notes)    │
│  • Audit Logger (compliance tracking)                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         Data Access Layer (Repositories)             │
│  • PatientRepository                                 │
│  • DoctorRepository                                  │
│  • AppointmentRepository                             │
│  • ClinicalNoteRepository                            │
│  • AuditLogRepository                                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         Database Layer (PostgreSQL + Knex)           │
│  Transactions, Migrations, Constraints               │
└─────────────────────────────────────────────────────┘
```

## Design Patterns Used

### 1. Repository Pattern

Abstracts data access layer, making it testable and database-agnostic.

```typescript
// Service uses repository interface
async findPatient(id: string): Promise<Patient | null> {
  return this.patientRepo.findById(id);
}
```

**Benefits:**

- Easy to mock in tests
- Consistent data access
- Single source of DB queries
- Easy to swap database

### 2. Dependency Injection

Services receive dependencies via constructor.

```typescript
constructor(
  private knex: Knex,
  private auditLogger: AuditLogger
) {}
```

**Benefits:**

- Testability
- Loose coupling
- Flexibility in configuration

### 3. DTO (Data Transfer Objects)

Define contracts for API requests/responses.

```typescript
export interface PatientDTO {
  id?: string;
  email: string;
  firstName: string;
  // ... other fields
}
```

**Benefits:**

- Clear API contracts
- Type safety
- Validation schemas tied to DTOs
- Separation from domain entities

### 4. Circuit Breaker Pattern

Prevents cascading failures when calling external APIs.

```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
  name: "insurance-api",
});

try {
  await breaker.execute(() => insuranceApi.check(patientId));
} catch (error) {
  // Circuit is open, fallback behavior
}
```

**Benefits:**

- Fail fast instead of hanging
- Automatic recovery attempts
- Prevents overload of failing services

### 5. Middleware Chain

Express middleware for cross-cutting concerns.

```
Request → Correlation ID → Logging → Auth → RBAC → Controller → Response
```

**Benefits:**

- Clean separation of concerns
- Reusable authentication logic
- Centralized error handling

## Data Flow

### Appointment Creation Flow

```
1. Client sends POST /appointments with JWT token
              ↓
2. correlationIdMiddleware: Adds trace ID to request
              ↓
3. requestLoggerMiddleware: Logs HTTP request
              ↓
4. authMiddleware: Validates JWT token
              ↓
5. rbacMiddleware: Checks if user has 'patient' role
              ↓
6. AppointmentController.createAppointment()
              ↓
7. validateInput(): Joi schema validation
              ↓
8. AppointmentService.createAppointment()
   ├─ Validates patient exists
   ├─ Validates doctor exists
   ├─ Validates appointment is in future
   └─ Creates appointment
              ↓
9. AppointmentRepository.create()
   └─ Inserts into database
              ↓
10. AuditLogger.log()
    └─ Records action in audit_logs
              ↓
11. OpenTelemetry instrumentation
    └─ Records span for distributed tracing
              ↓
12. Return 201 with appointment data
```

### Authentication Flow

```
Patient Registration:
1. POST /auth/patient/register with email, password, etc.
2. AuthService validates input (Joi)
3. Check if email already exists
4. Hash password with bcryptjs (10 rounds)
5. Store in database
6. Generate JWT token
7. Log audit event
8. Return token and patient data

Patient Login:
1. POST /auth/patient/login with email, password
2. Find patient by email
3. Compare password hash
4. Generate JWT token
5. Log audit event
6. Return token
```

## HIPAA Compliance Strategy

### PHI Protection in Logs

```typescript
// Logger automatically sanitizes sensitive data
logger.info("Patient registered", { patientId: "123" });
// ✅ Safe: no email/phone logged

logger.warn("Failed login attempt", { email: "user@example.com" });
// ✅ Sanitized: [REDACTED_EMAIL] in logs
```

### Access Control

```typescript
// Patient can only view their own data (RBAC enforced)
if (id !== requestingUserId && userType === "patient") {
  throw new Error("Cannot access other patients data");
}
```

### Audit Logging

Every PHI access is logged:

- Who accessed it (user ID)
- What action (view, update, delete)
- When it happened (timestamp)
- From where (IP address)
- Trace ID for investigation
- Success/failure status

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: No session state, can run multiple instances
- **Load Balancer**: AWS ALB/NLB can distribute requests
- **Database Connection Pooling**: Knex manages pool
- **Circuit Breaker**: Prevents overload of external services

### Vertical Scaling

- **Indexed Queries**: Fast lookups on `email`, `created_at`
- **Database Replication**: Read replicas for queries
- **Caching**: Future: Redis for frequently accessed data
- **Pagination**: List endpoints limit result size

### Monitoring Scalability

```typescript
// Track metrics that indicate scaling needs
const metrics = {
  p99_latency_ms: 500,
  db_connection_pool_usage: 0.8,
  error_rate_percent: 0.1,
  circuit_breaker_trips_per_minute: 2,
};

// Alert thresholds
if (metrics.p99_latency_ms > 1000) {
  // Scale up
}
```

## Security Architecture

### Authentication

- JWT tokens with 24-hour expiration
- Tokens validated on each request
- Refresh token support (future)

### Authorization

- Role-based access control (RBAC)
- Patient endpoints check `user.type === 'patient'`
- Doctor endpoints check `user.type === 'doctor'`
- Resource-level checks (can only modify own data)

### Encryption

- Passwords: bcryptjs with 10 salt rounds
- In-transit: HTTPS in production
- At-rest: Database encryption (AWS RDS)
- Secrets: AWS Secrets Manager

### Input Validation

- Joi schemas for all requests
- Type checking with TypeScript
- SQL injection prevention (ORM)
- XSS prevention (API only, no server-side rendering)

## Error Handling Strategy

### Error Types

```typescript
class ApiError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {
    // statusCode: HTTP status
    // code: Machine-readable error code
    // message: User-friendly message
  }
}
```

### Error Response Format

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "correlationId": "abc-123-def"
}
```

**No sensitive details in error responses:**

- ❌ Don't leak database schema
- ❌ Don't expose internal errors
- ❌ Don't include stack traces in responses
- ✅ Log full details server-side for debugging

## Testing Strategy

### Unit Tests (30%)

- Repository CRUD operations
- Service business logic
- Utility functions
- Validation schemas

### Integration Tests (30%)

- API endpoints
- Database interactions
- Auth flows
- Error scenarios

### Coverage Requirements

- Global minimum: 70%
- Critical paths: 90%+
- Enforced in CI/CD

## Performance Optimization

### Database

```sql
-- Indexed columns for common queries
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### API

- Pagination for list endpoints
- Select specific fields instead of SELECT \*
- Eager loading of related data
- Response compression (middleware)

### Caching (Future)

- Redis cache for doctor profiles
- TTL-based invalidation
- Cache-Control headers

## Future Enhancements

1. **Multi-tenancy**: Support multiple healthcare organizations
2. **Advanced Scheduling**: Conflict detection, recurring appointments
3. **Notifications**: Email/SMS appointment reminders
4. **Insurance Integration**: Eligibility verification with circuit breaker
5. **File Storage**: Medical documents/imaging (S3)
6. **Analytics**: KPI dashboards for administrators
7. **Mobile App**: React Native client
8. **Real-time**: WebSockets for notifications
9. **Rate Limiting**: Per-user/per-IP rate limits
10. **API Versioning**: v1, v2, v3 support
