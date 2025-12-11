# Quick Reference Guide

## Backend Setup (5 minutes)

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Steps

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy .env.example to .env
cp .env.example .env

# 4. Create database
createdb mediconnect

# 5. Run migrations
npm run migrate

# 6. (Optional) Seed sample data
npm run seed

# 7. Start development server
npm run dev
```

**Available at**: http://localhost:3001
**API Docs**: http://localhost:3001/api-docs

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run compiled code
npm start

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test              # All tests with coverage
npm run test:watch       # Watch mode
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only

# Database
npm run migrate           # Run migrations
npm run migrate:rollback  # Rollback migrations
npm run seed              # Seed sample data
```

## Docker Setup

```bash
# From project root
docker-compose up --build

# Services available:
# - Backend: http://localhost:3001
# - API Docs: http://localhost:3001/api-docs
# - Postgres: localhost:5432
# - Jaeger UI: http://localhost:16686
```

## Testing API Endpoints

### Register Patient

```bash
curl -X POST http://localhost:3001/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phone": "+1-555-1234",
    "gender": "male"
  }'
```

### Login Patient

```bash
curl -X POST http://localhost:3001/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePassword123!"
  }'
```

### Create Appointment (requires token from login)

```bash
curl -X POST http://localhost:3001/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "scheduledAt": "2024-12-20T10:00:00Z",
    "durationMinutes": 30,
    "reasonForVisit": "Regular checkup",
    "appointmentType": "in-person"
  }'
```

### Get Upcoming Appointments

```bash
curl -X GET http://localhost:3001/appointments/upcoming \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Access

```bash
# Connect to database
psql -U postgres -d mediconnect

# View tables
\dt

# View migration status
\d pg_migrations
```

## Common Issues & Solutions

### Issue: "Database does not exist"

```bash
# Solution: Create it
createdb mediconnect
npm run migrate
```

### Issue: "Port 3001 already in use"

```bash
# Solution: Use different port
PORT=3002 npm run dev
```

### Issue: "JWT_SECRET not set"

```bash
# Solution: Copy .env.example to .env
cp .env.example .env
# Edit .env with your values
```

### Issue: Tests failing with "ECONNREFUSED"

```bash
# Solution: Ensure test database exists
createdb mediconnect_test
npm run test
```

## File Structure Explanation

```
backend/
├── src/
│   ├── controllers/     → Handle HTTP requests
│   ├── services/        → Business logic
│   ├── repositories/    → Database queries
│   ├── middleware/      → Auth, logging, errors
│   ├── dtos/            → Request/response schemas
│   ├── entities/        → TypeScript models
│   ├── logging/         → Structured logging
│   ├── telemetry/       → Tracing setup
│   └── utils/           → Helpers (circuit breaker, etc)
├── migrations/          → Database schemas
├── tests/              → Unit & integration tests
└── index.ts            → Express app entry point
```

## Key Concepts

### DTOs (Data Transfer Objects)

Define what data can be sent/received by API. Located in `src/dtos/index.ts`.

### Repositories

Query the database. One per entity (patient, doctor, appointment, etc).

### Services

Implement business logic. Uses repositories to access data.

### Controllers

Handle HTTP requests. Call services and return responses.

### Middleware

Handle cross-cutting concerns (auth, logging, CORS).

## Architecture Overview

```
Request → Middleware → Controller → Service → Repository → Database
          ↓
      Authentication & Logging
```

## Useful Links

- **API Docs**: http://localhost:3001/api-docs
- **Jaeger Traces**: http://localhost:16686
- **GitHub**: [Your repo URL]
- **Documentation**: See README.md and ARCHITECTURE.md

## Next Steps

1. ✅ Backend API setup complete
2. ⬜ Frontend development (Next.js)
3. ⬜ Database seeding with real data
4. ⬜ API testing with Postman/Insomnia
5. ⬜ Production deployment to AWS ECS

## Getting Help

- Check README.md for full documentation
- Review ARCHITECTURE.md for design patterns
- Look at test files for usage examples
- Check CONFIG.md for environment variables
- Run `npm run lint` to check code quality

---

**Version**: 1.0.0  
**Last Updated**: December 2024
