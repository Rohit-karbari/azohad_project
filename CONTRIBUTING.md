# Contribution Guidelines

## Code Standards

- **Language**: TypeScript with strict mode enabled
- **Linting**: ESLint with @typescript-eslint
- **Formatting**: Prettier with 100-char line width
- **Testing**: Jest with minimum 70% coverage

## Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add/update tests
refactor: Refactor code
chore: Update dependencies
```

## Pull Request Process

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes and commit with meaningful messages
3. Push to feature branch
4. Create PR to `develop`
5. Ensure all checks pass:
   - Linting passes
   - Tests pass with >70% coverage
   - Docker builds successfully
   - No security vulnerabilities
6. Request review from maintainers
7. Once approved, merge and delete branch

## Testing Requirements

- Unit tests for services and repositories
- Integration tests for API endpoints
- Test PHI sanitization in logs
- Test RBAC enforcement
- Test error handling

## Security Checklist

- No hardcoded secrets
- No PHI in logs
- Input validation on all endpoints
- SQL injection prevention (using ORM)
- CORS properly configured
- JWT validation
- Rate limiting ready

## Performance Guidelines

- Database queries indexed where needed
- Avoid N+1 queries
- Use connection pooling
- Paginate list endpoints
- Cache where appropriate

## Documentation

- Update API docs for new endpoints (Swagger)
- Add comments for complex logic
- Update README for architectural changes
- Document new environment variables

## Deployment Checklist

- [ ] All tests passing
- [ ] Coverage threshold met
- [ ] Linting clean
- [ ] Docker image builds
- [ ] Database migrations created
- [ ] Documentation updated
- [ ] Security scan passes
- [ ] Performance tested
