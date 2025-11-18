# Deployment Guide for Next.js Boilerplate

This guide covers multiple deployment strategies for the Next.js Boilerplate application using Docker, Terraform, and Ansible.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Terraform Infrastructure](#terraform-infrastructure)
3. [Ansible Configuration](#ansible-configuration)
4. [Production Checklist](#production-checklist)
5. [Troubleshooting](#troubleshooting)

## Docker Deployment

### Quick Start with Docker

#### Development

```bash
# Start development environment
docker-compose --profile dev up

# Or build and run manually
docker build -f Dockerfile.dev -t nextjs-boilerplate:dev .
docker run -p 3000:3000 -v $(pwd):/app nextjs-boilerplate:dev
```

#### Production

```bash
# Build production image
docker build -t nextjs-boilerplate:latest .

# Run with Docker Compose
docker-compose --profile prod up -d

# Or run manually
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name nextjs-app \
  nextjs-boilerplate:latest
```

### Docker Compose Profiles

- `dev` - Development environment with hot-reload
- `prod` - Production environment with Nginx

### Environment Variables

Copy `.env.example` to `.env.production` and configure:

```bash
cp .env.example .env.production
# Edit .env.production with your production values
```

### Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

## Terraform Infrastructure

### Prerequisites

1. Install Terraform (>= 1.0):
```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

2. Configure AWS credentials:
```bash
aws configure
# Or export credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Infrastructure Setup

1. Navigate to Terraform directory:
```bash
cd terraform
```

2. Create your variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

3. Initialize Terraform:
```bash
terraform init
```

4. Plan infrastructure:
```bash
terraform plan -out=tfplan
```

5. Apply infrastructure:
```bash
terraform apply tfplan
```

### Infrastructure Components

The Terraform configuration creates:

- **VPC**: Isolated network with public/private subnets across 2 AZs
- **Security Groups**: Configured for ALB, application instances, and RDS
- **RDS PostgreSQL**: Managed database with automated backups
- **Application Load Balancer**: Distributes traffic with SSL/TLS support
- **Auto Scaling Group**: EC2 instances with auto-scaling based on CPU
- **CloudWatch**: Monitoring and alarms

### Outputs

After deployment, Terraform outputs:

```bash
terraform output alb_dns_name        # Load balancer URL
terraform output database_endpoint    # Database connection endpoint
```

### Destroying Infrastructure

```bash
terraform destroy
```

## Ansible Configuration

### Prerequisites

1. Install Ansible:
```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update
sudo apt install ansible

# RHEL/CentOS
sudo yum install ansible

# Or with pip
pip install ansible
```

2. Install required collections:
```bash
ansible-galaxy collection install community.docker
ansible-galaxy collection install community.general
ansible-galaxy collection install ansible.posix
```

### Configuration

1. Update inventory:
```bash
cd ansible
cp inventory/hosts.ini.example inventory/hosts.ini
# Edit inventory/hosts.ini with your server IPs
```

2. Configure variables:
```bash
# Edit group_vars/web.yml for production
vim group_vars/web.yml

# Use Ansible Vault for secrets
ansible-vault create group_vars/vault.yml
```

### Deployment Workflows

#### 1. Initial Server Setup

```bash
ansible-playbook playbooks/setup.yml
```

This installs:
- Docker and Docker Compose
- Nginx reverse proxy
- Monitoring tools
- System hardening

#### 2. Deploy Application

```bash
# Deploy from main branch
ansible-playbook playbooks/deploy.yml

# Deploy specific branch
ansible-playbook playbooks/deploy.yml -e "git_branch=develop"

# Deploy to specific environment
ansible-playbook playbooks/deploy.yml --limit staging
```

#### 3. Rollback

```bash
ansible-playbook playbooks/rollback.yml
# Enter commit hash when prompted
```

### Ansible Roles

- **common**: Base system configuration, users, firewall
- **docker**: Docker installation and configuration
- **nginx**: Reverse proxy setup with SSL
- **monitoring**: Health checks and monitoring

## Production Checklist

### Pre-Deployment

- [ ] Configure all environment variables in `.env.production`
- [ ] Set up SSL certificates (Let's Encrypt or AWS ACM)
- [ ] Configure database backups
- [ ] Set up monitoring and alerting
- [ ] Configure DNS records
- [ ] Test deployment in staging environment

### Security

- [ ] Use strong passwords for database
- [ ] Rotate `AUTH_SECRET` and API keys
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Enable rate limiting (Arcjet)
- [ ] Set up firewall rules
- [ ] Enable database encryption at rest
- [ ] Use IAM roles instead of hardcoded credentials (AWS)

### Performance

- [ ] Enable CDN for static assets
- [ ] Configure Redis/Memcached for session storage
- [ ] Set up database connection pooling
- [ ] Enable Gzip/Brotli compression
- [ ] Configure image optimization
- [ ] Set appropriate cache headers

### Monitoring

- [ ] Configure CloudWatch/monitoring dashboards
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation (Better Stack)
- [ ] Configure Discord/Slack alerts
- [ ] Create runbooks for common issues

## Deployment Strategies

### Option 1: Docker on Single Server

Best for: Small projects, staging environments

```bash
# Setup server
ansible-playbook playbooks/setup.yml --limit yourserver

# Deploy application
ansible-playbook playbooks/deploy.yml --limit yourserver
```

### Option 2: AWS with Terraform + Ansible

Best for: Production, scalable applications

```bash
# 1. Provision infrastructure
cd terraform
terraform apply

# 2. Get instance IPs
terraform output -json | jq '.instances.value'

# 3. Update Ansible inventory
# Edit ansible/inventory/hosts.ini with instance IPs

# 4. Configure servers
cd ../ansible
ansible-playbook playbooks/setup.yml

# 5. Deploy application
ansible-playbook playbooks/deploy.yml
```

### Option 3: Docker + Container Registry

Best for: CI/CD pipelines

```bash
# 1. Build and push to registry
docker build -t registry.example.com/nextjs-boilerplate:v1.0.0 .
docker push registry.example.com/nextjs-boilerplate:v1.0.0

# 2. Deploy via Ansible
ansible-playbook playbooks/deploy.yml \
  -e "docker_image=registry.example.com/nextjs-boilerplate:v1.0.0"
```

## Continuous Deployment

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t nextjs-boilerplate:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push nextjs-boilerplate:${{ github.sha }}

      - name: Deploy with Ansible
        run: |
          cd ansible
          ansible-playbook playbooks/deploy.yml \
            -e "docker_tag=${{ github.sha }}" \
            --vault-password-file <(echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}")
```

## Database Migrations

### Development

```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migration
```

### Production

Migrations run automatically during deployment, but you can run manually:

```bash
# Via Docker
docker exec nextjs-app npm run db:migrate

# Via Ansible
ansible web -a "docker exec nextjs-app npm run db:migrate"
```

## SSL/TLS Certificates

### Option 1: Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured by default
```

### Option 2: AWS Certificate Manager

1. Request certificate in AWS ACM
2. Add validation DNS records
3. Use certificate ARN in Terraform variables

```hcl
certificate_arn = "arn:aws:acm:us-east-1:123456789:certificate/xxxxx"
```

## Backup and Restore

### Database Backups

RDS automatic backups are configured in Terraform. Manual backup:

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20231201.sql
```

### Application Backups

```bash
# Backup entire application directory
ansible web -m archive -a "path=/opt/nextjs-boilerplate dest=/tmp/backup.tar.gz"

# Download backup
ansible web -m fetch -a "src=/tmp/backup.tar.gz dest=./backups/"
```

## Monitoring and Logging

### Health Checks

```bash
# Manual health check
curl https://yourdomain.com/api/health

# Automated monitoring (configured in Ansible)
# Runs every 5 minutes, logs to /var/log/app-monitoring/health.log
```

### View Logs

```bash
# Docker logs
docker logs -f nextjs-app

# Via Ansible
ansible web -a "docker logs --tail 100 -f nextjs-app"

# System logs
journalctl -u docker -f
```

## Scaling

### Vertical Scaling (Terraform)

Update instance type in `terraform.tfvars`:

```hcl
instance_type = "t3.large"  # Upgrade from t3.small
```

Apply changes:
```bash
terraform apply
```

### Horizontal Scaling (Terraform)

Update auto-scaling parameters:

```hcl
asg_desired_capacity = 4  # Increase from 2
asg_max_size = 8          # Increase max capacity
```

## Troubleshooting

### Application Won't Start

```bash
# Check Docker logs
docker logs nextjs-app

# Check if port is in use
sudo lsof -i :3000

# Verify environment variables
docker exec nextjs-app env | grep DATABASE_URL
```

### Database Connection Issues

```bash
# Test database connection
docker exec nextjs-app psql $DATABASE_URL -c "SELECT 1"

# Check security groups (AWS)
# Ensure app security group can access DB security group on port 5432
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats nextjs-app

# Increase container resources
# Edit docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### SSL Certificate Issues

```bash
# Check certificate expiry
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew
```

## Performance Optimization

### Enable Caching

Nginx caching is configured by default. Verify:

```bash
# Check cache directory
ls -lh /var/cache/nginx/

# Monitor cache hit rate
tail -f /var/log/nginx/access.log | grep "X-Cache-Status"
```

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_email ON users(email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
```

### CDN Integration

Configure Cloudflare or CloudFront:

1. Point DNS to CDN
2. Configure origin (ALB DNS name)
3. Set cache rules for static assets

## Support and Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)

## License

See LICENSE file in project root.
