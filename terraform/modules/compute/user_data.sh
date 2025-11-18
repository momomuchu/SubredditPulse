#!/bin/bash
# ============================================================================
# User Data Script for EC2 Instances
# ============================================================================
# This script runs on instance startup to configure and start the application
# ============================================================================

set -e

# Update system
sudo dnf update -y

# Install Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install CloudWatch agent
sudo dnf install -y amazon-cloudwatch-agent

# Create application directory
sudo mkdir -p /opt/app
cd /opt/app

# Create environment file
sudo tee /opt/app/.env.production << EOF
DATABASE_URL=${database_url}
PORT=${app_port}
NODE_ENV=production
%{ for key, value in environment_variables ~}
${key}=${value}
%{ endfor ~}
EOF

# Create docker-compose file for production deployment
sudo tee /opt/app/docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'
services:
  app:
    image: your-ecr-repo/nextjs-boilerplate:latest
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/aws/ec2/nextjs-boilerplate"
        awslogs-region: "us-east-1"
        awslogs-stream-prefix: "app"
COMPOSE_EOF

# Pull and start the application
# Note: You'll need to configure ECR authentication or use your own registry
# sudo docker-compose pull
# sudo docker-compose up -d

# Configure log rotation
sudo tee /etc/logrotate.d/docker-compose << 'LOGROTATE_EOF'
/var/log/docker-compose.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
LOGROTATE_EOF

echo "Instance setup complete!"
