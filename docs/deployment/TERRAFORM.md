# Terraform Infrastructure Guide

Infrastructure as Code for deploying Next.js Boilerplate on AWS.

## Architecture

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
Auto Scaling Group (EC2)
    ↓
RDS PostgreSQL
```

### Components

- **VPC**: 10.0.0.0/16 with public/private subnets across 2 AZs
- **ALB**: Application Load Balancer with SSL/TLS
- **ASG**: Auto Scaling Group with 1-4 EC2 instances
- **RDS**: PostgreSQL 16 with automated backups
- **Security Groups**: Least-privilege access rules
- **CloudWatch**: Monitoring and auto-scaling triggers

## Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# Configure AWS credentials
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="us-east-1"
```

## Configuration

1. **Copy example variables**:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

2. **Edit terraform.tfvars**:
```hcl
project_name = "nextjs-boilerplate"
environment  = "production"
aws_region   = "us-east-1"

# Database
db_name     = "nextjs_boilerplate"
db_username = "dbadmin"
db_password = "YOUR_SECURE_PASSWORD"  # Use AWS Secrets Manager in production

# Compute
instance_type = "t3.small"
key_name      = "your-ssh-key"

# SSL Certificate (from AWS ACM)
certificate_arn = "arn:aws:acm:us-east-1:123456789:certificate/xxxxx"

# Application environment variables
environment_variables = {
  NODE_ENV                    = "production"
  NEXT_PUBLIC_APP_URL         = "https://yourdomain.com"
  AUTH_SECRET                 = "your-secret-here"
  # ... add all required env vars
}
```

3. **Create SSH key pair** (if not exists):
```bash
aws ec2 create-key-pair \
  --key-name nextjs-boilerplate-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/nextjs-boilerplate-key.pem

chmod 400 ~/.ssh/nextjs-boilerplate-key.pem
```

## Deployment

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads required providers and modules.

### 2. Plan Infrastructure

```bash
terraform plan -out=tfplan
```

Review the plan to see what will be created.

### 3. Apply Infrastructure

```bash
terraform apply tfplan
```

This creates:
- 1 VPC
- 2 Public subnets
- 2 Private subnets
- 2 NAT Gateways
- 1 Application Load Balancer
- 1 Auto Scaling Group
- 1 RDS PostgreSQL instance
- Security groups and IAM roles

**Time**: ~10-15 minutes

### 4. Get Outputs

```bash
# Load balancer URL
terraform output alb_dns_name

# Database endpoint
terraform output database_endpoint

# All outputs
terraform output
```

### 5. Configure DNS

Point your domain to the ALB:

```bash
# Get ALB DNS name and Zone ID
terraform output alb_dns_name
terraform output alb_zone_id

# Create Route53 alias record or CNAME with your DNS provider
```

## Modules

### VPC Module

Creates network infrastructure:
- VPC with DNS support
- Internet Gateway
- Public/Private subnets in multiple AZs
- NAT Gateways for private subnet internet access
- Route tables

### Security Module

Creates security groups:
- ALB: Allows 80/443 from internet
- App: Allows 3000 from ALB, 22 from anywhere (restrict in production)
- DB: Allows 5432 from app instances only

### Database Module

Creates RDS PostgreSQL:
- PostgreSQL 16
- Automated backups (7 day retention)
- Multi-AZ for production
- Encrypted storage
- CloudWatch logs enabled

### ALB Module

Creates Application Load Balancer:
- Internet-facing
- Health checks on /api/health
- HTTPS with SSL certificate
- HTTP to HTTPS redirect
- Cross-zone load balancing

### Compute Module

Creates Auto Scaling Group:
- EC2 instances with Docker
- Launch template with user data
- Auto-scaling based on CPU (75% scale up, 25% scale down)
- CloudWatch monitoring
- IMDSv2 required

## State Management

### Local State (Default)

```bash
# State stored in terraform.tfstate
# NOT recommended for production
```

### Remote State (Recommended)

1. Create S3 bucket and DynamoDB table:
```bash
aws s3 mb s3://your-terraform-state-bucket
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

2. Uncomment backend in main.tf:
```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "nextjs-boilerplate/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

3. Re-initialize:
```bash
terraform init -migrate-state
```

## Environments

### Multiple Environments

Create separate tfvars files:

```bash
# Development
terraform apply -var-file="dev.tfvars"

# Staging
terraform apply -var-file="staging.tfvars"

# Production
terraform apply -var-file="production.tfvars"
```

### Workspaces

```bash
# Create workspace
terraform workspace new staging

# Switch workspace
terraform workspace select production

# List workspaces
terraform workspace list
```

## Cost Optimization

### Development/Staging

```hcl
# Use smaller instances
instance_type = "t3.micro"
db_instance_class = "db.t3.micro"

# Single AZ
asg_min_size = 1
asg_max_size = 2

# No Multi-AZ RDS
# (automatically disabled for non-production)
```

### Production

```hcl
# Larger instances
instance_type = "t3.medium"
db_instance_class = "db.t3.small"

# High availability
asg_min_size = 2
asg_max_size = 6

# Multi-AZ RDS
# (automatically enabled for production)
```

### Estimated Costs (us-east-1)

**Development** (~$50/month):
- 1x t3.micro EC2: ~$7.50
- 1x db.t3.micro RDS: ~$15
- 1x NAT Gateway: ~$32
- ALB: ~$16

**Production** (~$250/month):
- 2x t3.small EC2: ~$30
- 1x db.t3.small Multi-AZ: ~$70
- 2x NAT Gateway: ~$64
- ALB: ~$16
- Data transfer: ~$20
- Storage: ~$50

## Scaling

### Vertical Scaling

Update instance sizes:
```hcl
instance_type = "t3.large"
db_instance_class = "db.t3.large"
```

Apply:
```bash
terraform apply
```

### Horizontal Scaling

Update Auto Scaling parameters:
```hcl
asg_min_size = 2
asg_max_size = 10
asg_desired_capacity = 4
```

### Auto-Scaling Triggers

Default configuration:
- Scale up: CPU > 75% for 10 minutes
- Scale down: CPU < 25% for 10 minutes
- Cooldown: 5 minutes

## Security Best Practices

1. **Use AWS Secrets Manager** for sensitive data:
```bash
# Store database password
aws secretsmanager create-secret \
  --name nextjs-boilerplate/db-password \
  --secret-string "your-secure-password"
```

2. **Restrict SSH access**:
```hcl
# In security group module, replace 0.0.0.0/0 with your IP
cidr_blocks = ["YOUR_IP/32"]
```

3. **Enable encryption**:
- RDS: Enabled by default
- EBS: Enabled in launch template
- S3 (for state): Enable server-side encryption

4. **Use IAM roles** instead of access keys
5. **Enable CloudTrail** for audit logging
6. **Enable GuardDuty** for threat detection

## Monitoring

### CloudWatch Dashboards

```bash
# View metrics in AWS Console
# CloudWatch → Dashboards → Create dashboard
```

Key metrics:
- ALB: RequestCount, TargetResponseTime, HealthyHostCount
- ASG: CPUUtilization, NetworkIn/Out
- RDS: CPUUtilization, DatabaseConnections, FreeStorageSpace

### Alarms

Configured automatically:
- High CPU (> 75%)
- Low CPU (< 25%)

Add custom alarms:
```hcl
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${var.project_name}-unhealthy-hosts"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

## Backup and Disaster Recovery

### RDS Backups

Automated:
- Daily snapshots
- 7 day retention (configurable)
- Point-in-time recovery

Manual backup:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier nextjs-boilerplate-production-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Restore

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier nextjs-boilerplate-restored \
  --db-snapshot-identifier manual-backup-20231201
```

## Troubleshooting

### Terraform Errors

```bash
# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Debug mode
TF_LOG=DEBUG terraform apply
```

### State Issues

```bash
# Refresh state
terraform refresh

# Show current state
terraform show

# Remove resource from state (danger)
terraform state rm module.compute.aws_instance.app
```

### Destroy and Recreate

```bash
# Destroy specific resource
terraform destroy -target=module.compute

# Recreate
terraform apply -target=module.compute
```

## Cleanup

```bash
# Destroy all infrastructure
terraform destroy

# Destroy specific environment
terraform destroy -var-file="staging.tfvars"
```

**Warning**: This deletes all resources including databases. Take backups first!

## Advanced

### Import Existing Resources

```bash
terraform import module.vpc.aws_vpc.main vpc-12345678
```

### Custom Modules

Create reusable modules in `modules/`:
```
modules/
  custom-module/
    main.tf
    variables.tf
    outputs.tf
```

### Terraform Cloud

Use Terraform Cloud for:
- Remote state management
- Collaborative workflows
- Policy as Code
- Cost estimation
- Private module registry
