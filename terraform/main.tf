# ============================================================================
# Main Terraform Configuration for Next.js Boilerplate
# ============================================================================
# This configuration provisions infrastructure on AWS for the Next.js app
# including VPC, EC2, RDS, and Load Balancer
# ============================================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for remote state
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "nextjs-boilerplate/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# ============================================================================
# Provider Configuration
# ============================================================================
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ============================================================================
# Data Sources
# ============================================================================
data "aws_availability_zones" "available" {
  state = "available"
}

# ============================================================================
# Modules
# ============================================================================

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = data.aws_availability_zones.available.names
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# Security Groups
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# RDS PostgreSQL Database
module "database" {
  source = "./modules/database"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  db_subnet_ids          = module.vpc.private_subnet_ids
  db_security_group_id   = module.security.db_security_group_id
  db_instance_class      = var.db_instance_class
  db_allocated_storage   = var.db_allocated_storage
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  backup_retention_period = var.backup_retention_period
  multi_az               = var.environment == "production"
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  public_subnet_ids    = module.vpc.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  certificate_arn      = var.certificate_arn
}

# EC2 Instances / Auto Scaling Group
module "compute" {
  source = "./modules/compute"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  app_security_group_id   = module.security.app_security_group_id
  target_group_arn        = module.alb.target_group_arn
  instance_type           = var.instance_type
  key_name                = var.key_name
  min_size                = var.asg_min_size
  max_size                = var.asg_max_size
  desired_capacity        = var.asg_desired_capacity

  # Application configuration
  app_port                = 3000
  database_url            = module.database.connection_string
  environment_variables   = var.environment_variables
}

# ============================================================================
# Outputs
# ============================================================================
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Load Balancer DNS Name"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Load Balancer Zone ID"
  value       = module.alb.alb_zone_id
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "database_connection_string" {
  description = "Database connection string"
  value       = module.database.connection_string
  sensitive   = true
}
