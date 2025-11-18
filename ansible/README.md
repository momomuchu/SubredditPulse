# Ansible Deployment for Next.js Boilerplate

Automated server configuration and deployment using Ansible.

## Prerequisites

- Ansible 2.10 or later installed on your local machine
- SSH access to target servers
- Python 3 on target servers

## Installation

```bash
# Install Ansible
pip install ansible

# Install required Ansible collections
ansible-galaxy collection install community.docker
ansible-galaxy collection install community.general
ansible-galaxy collection install ansible.posix
```

## Configuration

1. Update inventory file:
```bash
cp inventory/hosts.ini.example inventory/hosts.ini
# Edit inventory/hosts.ini with your server details
```

2. Configure variables:
```bash
# Edit group_vars/web.yml with your production values
# Edit group_vars/staging.yml for staging environment
```

3. Set up secrets (use Ansible Vault for sensitive data):
```bash
ansible-vault create group_vars/secrets.yml
```

## Usage

### Setup New Server

```bash
# Setup all servers
ansible-playbook playbooks/setup.yml

# Setup specific host group
ansible-playbook playbooks/setup.yml --limit web
```

### Deploy Application

```bash
# Deploy to production
ansible-playbook playbooks/deploy.yml

# Deploy specific branch
ansible-playbook playbooks/deploy.yml -e "git_branch=develop"

# Deploy to staging
ansible-playbook playbooks/deploy.yml --limit staging
```

### Rollback

```bash
# Rollback to specific commit
ansible-playbook playbooks/rollback.yml
```

### Health Check

```bash
# Check application health
ansible web -m uri -a "url=http://localhost:3000/api/health"
```

## Playbooks

- `setup.yml` - Initial server setup and configuration
- `deploy.yml` - Deploy application
- `rollback.yml` - Rollback to previous version

## Roles

- `common` - Common server configuration
- `docker` - Docker installation and configuration
- `nginx` - Nginx reverse proxy setup
- `monitoring` - Monitoring and health checks

## Security

Store sensitive variables using Ansible Vault:

```bash
# Create vault file
ansible-vault create group_vars/vault.yml

# Edit vault file
ansible-vault edit group_vars/vault.yml

# Run playbook with vault
ansible-playbook playbooks/deploy.yml --ask-vault-pass
```

## Troubleshooting

Check connectivity:
```bash
ansible all -m ping
```

Run in verbose mode:
```bash
ansible-playbook playbooks/deploy.yml -vvv
```
