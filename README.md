# MediConnect - Healthcare Patient Appointment & Notes Platform

A production-ready healthcare microservice built with Node.js, Next.js, PostgreSQL, and AWS ECS. This platform provides secure patient registration, doctor management, appointment scheduling, and clinical notes with enterprise-grade security and observability.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security Highlights](#security-highlights)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Healthcare Engineering Considerations](#healthcare-engineering-considerations)
- [Observability & Monitoring](#observability--monitoring)
- [CI/CD Pipeline](#cicd-pipeline)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│         Patient & Doctor Dashboards, Login Flows                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/JWT
┌──────────────────────────▼──────────────────────────────────────┐
│              Backend API (Express.js)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Controllers → Services → Repositories → Database            │ │
│  │                                                              │ │
│  │ Features:                                                    │ │
│  │ • Authentication & RBAC (JWT-based)                         │ │
│  │ • Audit Logging (PHI-safe)                                 │ │
│  │ • Circuit Breaker Pattern                                  │ │
│  │ • Correlation IDs for tracing                              │ │
│  │ • Input validation & sanitization                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────┐   ┌────────▼────────┐  ┌─────▼──────────┐
│ PostgreSQL  │   │    Jaeger       │  │  Insurance API │
│ Database    │   │    (Tracing)    │  │  (w/ Breaker)  │
└─────────────┘   └─────────────────┘  └────────────────┘
```

## Features

### Patient Management

- User registration with email verification
- Profile management
- Secure password hashing with bcryptjs
- Email-based authentication

### Doctor Management

- Doctor registration with license verification
- Specialization tracking
- Profile management

### Appointments

- Schedule appointments with doctors
- View upcoming appointments
- Cancel appointments
- Appointment type support (in-person, telehealth)

### Clinical Notes

- Doctors can add detailed clinical notes
- PHI (Personal Health Information) protected
- Note status management (draft, finalized, signed)

### Security & Compliance

- JWT-based authentication with RBAC
- PHI sanitization in logs
- Comprehensive audit logging
- Input validation and sanitization
- SQL injection prevention via ORM

### Microservice Patterns

- Repository pattern for data access
- DTOs for API contracts
- Service layer for business logic
- Circuit breaker for external APIs
- Correlation IDs for distributed tracing

### Observability

- OpenTelemetry instrumentation
- Jaeger distributed tracing integration
- Winston structured logging with PHI redaction
- Health check endpoints
- KPI metrics collection

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi
- **Logging**: Winston with PHI sanitization
- **Tracing**: OpenTelemetry + Jaeger
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI 3.0 with Swagger UI

### Frontend

- **Framework**: Next.js 13+
- **State Management**: TBD (React Context or Redux)
- **UI Library**: TBD (Tailwind CSS recommended)
- **API Client**: Axios with JWT interceptor

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: AWS ECS (Elastic Container Service)
- **Database**: AWS RDS PostgreSQL
- **Monitoring**: CloudWatch + OpenTelemetry
- **Registry**: GitHub Container Registry (GHCR)

## Security Highlights

### Authentication & Authorization

- JWT tokens with 24-hour expiration (configurable)
- RBAC (Role-Based Access Control) at endpoint level
- Password hashing with bcrypt (10 salt rounds)
- Secure token verification on protected routes

### PHI Protection

- Automatic email/phone/SSN redaction in logs
- No sensitive data in error messages
- Correlation IDs for audit trail
- Comprehensive audit logging of all operations

### Data Validation

- Input validation using Joi schemas
- Type-safe ORM queries preventing SQL injection
- Request sanitization middleware
- CORS configuration for frontend integration

### API Security

- HTTPS enforcement (in production)
- Bearer token authentication
- Rate limiting (recommended)
- API documentation with security schemas

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AZohad_Project
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Configure Database**

   ```bash
   # Create PostgreSQL database
   createdb mediconnect

   # Run migrations
   npm run migrate

   # (Optional) Seed sample data
   npm run seed
   ```

4. **Run Backend**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

   - API: `http://localhost:3001`
   - API Docs: `http://localhost:3001/api-docs`
   - Health Check: `http://localhost:3001/health`

5. **Setup Frontend** (placeholder for now)

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

### Using Docker Compose

```bash
docker-compose up --build
```

Services will be available at:

- **Backend API**: `http://localhost:3001`
- **API Docs**: `http://localhost:3001/api-docs`
- **Jaeger UI**: `http://localhost:16686`
- **PostgreSQL**: `localhost:5432`

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # HTTP request handlers
│   ├── db/              # Database initialization
│   ├── dtos/            # Data Transfer Objects
│   ├── entities/        # Domain entities/models
│   ├── logging/         # Winston logger setup
│   ├── middleware/      # Express middleware
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── telemetry/       # OpenTelemetry setup
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Express app setup
├── migrations/          # Database migrations
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── Dockerfile
├── jest.config.js
├── knexfile.ts
├── package.json
└── tsconfig.json
```

### Environment Variables

See `.env.example` for all available options:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediconnect
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
LOG_LEVEL=info
ENABLE_TELEMETRY=true
```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run compiled code
npm start

# Code quality
npm run lint
npm run lint:fix

# Database
npm run migrate
npm run migrate:rollback

# Testing
npm run test              # Full test suite
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch       # Watch mode
```

## Testing

### Test Coverage

- **Minimum threshold**: 70% (enforced in CI)
- **Unit tests**: Repository, Service, Controller logic
- **Integration tests**: API endpoints, database operations
- **Test runner**: Jest with ts-jest
- **Assertion library**: Jest built-in matchers

### Running Tests

```bash
# Full test suite with coverage
npm run test

# Generate coverage report
npm run test -- --coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npm run test -- patient.repository.test.ts
```

### Test Examples

- `tests/unit/repositories/patient.repository.test.ts` - Repository CRUD operations
- `tests/unit/services/auth.service.test.ts` - Authentication logic
- Future: API endpoint tests with Supertest

## Deployment

### Docker Build

```bash
cd backend
docker build -t mediconnect-backend:latest .
```

### AWS ECS Deployment Blueprint

1. **Create ECR Repository**

   ```bash
   aws ecr create-repository --repository-name mediconnect-backend
   ```

2. **Build and Push Image**

   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag mediconnect-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/mediconnect-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/mediconnect-backend:latest
   ```

3. **Create ECS Task Definition** (JSON)

   ```json
   {
     "family": "mediconnect-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "mediconnect-backend",
         "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/mediconnect-backend:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           { "name": "NODE_ENV", "value": "production" },
           { "name": "DB_HOST", "value": "<rds-endpoint>" }
         ],
         "secrets": [
           { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..." },
           { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..." }
         ]
       }
     ]
   }
   ```

4. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster mediconnect-cluster \
     --service-name mediconnect-backend \
     --task-definition mediconnect-backend \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}
   ```

## API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3001/api-docs`
- **ReDoc**: Available via configuration

### Example Endpoints

#### Patient Registration

```bash
POST /auth/patient/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1-555-1234",
  "gender": "male"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "patient": {
      "id": "uuid",
      "email": "patient@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Create Appointment

```bash
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "scheduledAt": "2024-12-20T10:00:00Z",
  "durationMinutes": 30,
  "reasonForVisit": "Regular checkup",
  "appointmentType": "in-person"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "appointment-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "scheduledAt": "2024-12-20T10:00:00Z",
    "status": "scheduled"
  }
}
```

#### Get Upcoming Appointments

```bash
GET /appointments/upcoming
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "appointment-uuid",
      "patientId": "patient-uuid",
      "doctorId": "doctor-uuid",
      "scheduledAt": "2024-12-20T10:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

## Healthcare Engineering Considerations

### HIPAA Compliance (Foundation)

- PHI (Protected Health Information) handling through log sanitization
- Audit logging for all PHI access
- Encryption-at-rest and in-transit recommendations

### Data Privacy

- Password hashing with strong algorithms
- No hardcoding of sensitive data
- Secure token management
- Correlation IDs for audit trails

### Error Handling

- Human-readable error messages
- No sensitive details in error responses
- Proper HTTP status codes
- Structured error format with error codes

### Reliability

- Database constraints for data integrity
- Transaction support for critical operations
- Connection pooling via Knex
- Graceful shutdown handlers

### Performance

- Database indexing on frequently queried fields
- Pagination support for list endpoints
- Connection pooling
- Response caching (future enhancement)

### Scalability

- Stateless API design (horizontal scaling)
- Load balancer ready (AWS ELB/ALB)
- Database replication support
- Circuit breaker for external dependencies

## Observability & Monitoring

### Structured Logging

```typescript
logger.info("Appointment created", {
  appointmentId: appointment.id,
  patientId: patient.id,
  doctorId: doctor.id,
  correlationId: correlationId,
});
```

### Distributed Tracing

- OpenTelemetry instrumentation of critical paths
- Jaeger integration for trace visualization
- Correlation IDs across services
- Latency tracking

### Key Performance Indicators (KPIs)

1. **API Latency**

   - Track request duration per endpoint
   - Identify slow queries

2. **Database Latency**

   - Monitor query execution time
   - Connection pool utilization

3. **Error Rates**

   - Track 4xx and 5xx responses
   - Categorize by error type

4. **Circuit Breaker State**

   - Monitor external API failures
   - Track state transitions

5. **Audit Log Volume**
   - Critical operations logging
   - User activity tracking

### Metrics Export

```typescript
const metrics = {
  api_latency_ms: duration,
  db_query_time_ms: queryTime,
  error_rate_percent: errorCount / totalRequests,
  circuit_breaker_state: "CLOSED" | "OPEN" | "HALF_OPEN",
};
```

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

**On every push to main/develop:**

1. **Lint & Test** (Ubuntu latest)

   - Install dependencies
   - Run ESLint
   - Run database migrations (test DB)
   - Run full test suite with Jest
   - Upload coverage to Codecov
   - Enforce 70% coverage threshold

2. **Build Docker Image**

   - Build multi-stage Dockerfile
   - Push to GitHub Container Registry (GHCR)
   - Tag with git ref and SHA

3. **Security Scan**
   - Run Trivy vulnerability scanner
   - Upload SARIF results to GitHub Security

### Status Badges (in README)

```markdown
![Tests](https://github.com/.../workflows/CI%2FCD/badge.svg)
[![codecov](https://codecov.io/gh/.../branch/main/graph/badge.svg)](...)
```

### Deployment (Manual or via CD)

- Trigger ECS deployment after successful build
- Database migration via Lambda
- Health check verification
- Rollback capability

## Contributing

1. Create feature branch from `develop`
2. Commit with clear messages
3. Push to feature branch
4. Create Pull Request to `develop`
5. Ensure CI passes (tests, linting, coverage)
6. Code review approval required
7. Merge to develop, then squash merge to main

## License

Proprietary - Healthcare Application

## Support & Contact

For issues, questions, or security concerns:

- Email: support@mediconnect.com
- Issue Tracker: GitHub Issues
- Security: security@mediconnect.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
