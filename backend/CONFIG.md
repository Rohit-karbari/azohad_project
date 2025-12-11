# Environment Configuration Guide

## Development Environment (.env.development)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediconnect
DB_USER=postgres
DB_PASSWORD=postgres

# Server
NODE_ENV=development
PORT=3001

# JWT
JWT_SECRET=dev-secret-key-12345
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=debug

# Telemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
ENABLE_TELEMETRY=true

# External Services
INSURANCE_API_URL=http://localhost:8888
INSURANCE_API_TIMEOUT=5000
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Production Environment (.env.production)

```env
# Database (AWS RDS)
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_NAME=mediconnect
DB_USER=<secure-username>
DB_PASSWORD=<from-secrets-manager>

# Server
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=<from-secrets-manager>
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=warn

# Telemetry
OTEL_EXPORTER_OTLP_ENDPOINT=<jaeger-endpoint>
ENABLE_TELEMETRY=true

# External Services
INSURANCE_API_URL=https://api.insurance.com
INSURANCE_API_TIMEOUT=10000
CIRCUIT_BREAKER_THRESHOLD=3
CIRCUIT_BREAKER_TIMEOUT=120000

# CORS
ALLOWED_ORIGINS=https://app.mediconnect.com,https://api.mediconnect.com

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<account-id>
ECS_CLUSTER_NAME=mediconnect-cluster
ECS_SERVICE_NAME=mediconnect-backend
```

## Test Environment (.env.test)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediconnect_test
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=test
PORT=3001
JWT_SECRET=test-secret
LOG_LEVEL=error
ENABLE_TELEMETRY=false
```

## Secrets Management (AWS Secrets Manager)

Recommended secrets to store:
- `mediconnect/jwt-secret`
- `mediconnect/db-password`
- `mediconnect/insurance-api-key`
- `mediconnect/mail-api-key`

Retrieve in application:
```bash
aws secretsmanager get-secret-value --secret-id mediconnect/jwt-secret
```
