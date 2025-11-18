# Docker Deployment Guide

Quick reference for deploying the Next.js Boilerplate using Docker.

## Quick Start

### Development

```bash
# Using Docker Compose
docker-compose --profile dev up

# Manual
docker build -f Dockerfile.dev -t nextjs-boilerplate:dev .
docker run -p 3000:3000 -v $(pwd):/app nextjs-boilerplate:dev
```

### Production

```bash
# Build
docker build -t nextjs-boilerplate:latest .

# Run with Docker Compose
docker-compose --profile prod up -d

# Run manually
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name nextjs-app \
  nextjs-boilerplate:latest
```

## Docker Files

### Dockerfile

Multi-stage production build:
- Stage 1: Install dependencies
- Stage 2: Build application
- Stage 3: Runtime with minimal footprint

### Dockerfile.dev

Development build with:
- Hot-reload support
- All dev dependencies
- Volume mounting for code changes

### docker-compose.yml

Includes:
- PostgreSQL database
- Next.js application (dev/prod)
- Nginx reverse proxy
- Volume management
- Network configuration

## Environment Variables

```bash
# Create production environment file
cp .env.example .env.production

# Edit with your values
vim .env.production
```

Required variables:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Database

PostgreSQL included in Docker Compose:

```bash
# Access database
docker exec -it nextjs-boilerplate-db psql -U postgres -d nextjs_boilerplate

# Run migrations
docker exec nextjs-app npm run db:migrate

# View database logs
docker logs nextjs-boilerplate-db
```

## Nginx Reverse Proxy

Nginx configuration includes:
- SSL/TLS termination
- Gzip compression
- Caching strategy
- Security headers
- Rate limiting

Configure SSL:
```bash
# Copy certificates to nginx/ssl/
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/
```

## Common Commands

```bash
# View logs
docker logs -f nextjs-app

# Shell access
docker exec -it nextjs-app sh

# Restart application
docker-compose --profile prod restart app

# Stop all services
docker-compose down

# Remove volumes (DANGER: deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose --profile prod up -d --build

# View resource usage
docker stats
```

## Health Checks

Application includes built-in health checks:

```bash
# Check application health
curl http://localhost:3000/api/health

# Docker health status
docker ps | grep nextjs-app
```

## Performance Tips

1. **Use multi-stage builds** (already configured)
2. **Leverage build cache**: Don't change package.json frequently
3. **Use .dockerignore**: Exclude unnecessary files
4. **Set resource limits**:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs nextjs-app

# Inspect container
docker inspect nextjs-app

# Check if port is in use
lsof -i :3000
```

### Database connection failed

```bash
# Verify database is running
docker ps | grep postgres

# Check database logs
docker logs nextjs-boilerplate-db

# Test connection
docker exec nextjs-app pg_isready -h postgres -U postgres
```

### Build fails

```bash
# Clear Docker cache
docker builder prune

# Build without cache
docker build --no-cache -t nextjs-boilerplate:latest .
```

## Production Best Practices

1. **Use specific image tags** (not `latest`)
2. **Scan for vulnerabilities**: `docker scan nextjs-boilerplate:latest`
3. **Run as non-root user** (already configured)
4. **Enable health checks** (already configured)
5. **Set resource limits**
6. **Use secrets management** (Docker secrets or env files)
7. **Regular updates**: Keep base images updated

## Security

```bash
# Scan image for vulnerabilities
docker scan nextjs-boilerplate:latest

# Check for security issues
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image nextjs-boilerplate:latest
```

## Container Registry

### Push to Docker Hub

```bash
# Tag image
docker tag nextjs-boilerplate:latest username/nextjs-boilerplate:v1.0.0

# Login
docker login

# Push
docker push username/nextjs-boilerplate:v1.0.0
```

### Push to AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag nextjs-boilerplate:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/nextjs-boilerplate:v1.0.0

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/nextjs-boilerplate:v1.0.0
```

## Monitoring

```bash
# Resource usage
docker stats nextjs-app

# Inspect container
docker inspect nextjs-app

# View processes
docker top nextjs-app
```
