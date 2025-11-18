variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "app_security_group_id" {
  description = "Application security group ID"
  type        = string
}

variable "target_group_arn" {
  description = "Target group ARN"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "min_size" {
  description = "Minimum instances"
  type        = number
}

variable "max_size" {
  description = "Maximum instances"
  type        = number
}

variable "desired_capacity" {
  description = "Desired instance capacity"
  type        = number
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "environment_variables" {
  description = "Application environment variables"
  type        = map(string)
  default     = {}
  sensitive   = true
}
