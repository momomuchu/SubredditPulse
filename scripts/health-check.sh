#!/bin/bash
# ============================================================================
# Health Check Script for Next.js Boilerplate
# ============================================================================
# This script checks the health of the application and sends alerts if issues
# are detected.
#
# Usage: ./scripts/health-check.sh
# Cron: */5 * * * * /path/to/health-check.sh
# ============================================================================

set -e

# Configuration
APP_URL="${APP_URL:-http://localhost:3000}"
HEALTH_ENDPOINT="${APP_URL}/api/health"
LOG_FILE="${LOG_FILE:-/var/log/app-monitoring/health.log}"
ERROR_LOG="${ERROR_LOG:-/var/log/app-monitoring/errors.log}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK_URL:-}"
MAX_RESPONSE_TIME=5000  # milliseconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$ERROR_LOG")"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG"
}

# Function to send Discord notification
send_discord_alert() {
    local message="$1"
    local color="${2:-16711680}"  # Default red

    if [ -n "$DISCORD_WEBHOOK" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"🚨 Health Check Alert\",
                    \"description\": \"$message\",
                    \"color\": $color,
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null
    fi
}

# Function to check HTTP endpoint
check_http() {
    local url="$1"
    local start_time=$(date +%s%3N)

    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$url" --max-time 10 2>&1) || {
        log_error "Failed to connect to $url"
        send_discord_alert "Failed to connect to application at $url"
        return 1
    }

    local http_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d'.' -f1)

    if [ "$http_code" -eq 200 ]; then
        log "✅ Health check passed (HTTP $http_code, ${response_time_ms}ms)"

        if [ "$response_time_ms" -gt "$MAX_RESPONSE_TIME" ]; then
            log_error "Slow response detected: ${response_time_ms}ms (threshold: ${MAX_RESPONSE_TIME}ms)"
            send_discord_alert "⚠️ Slow response: ${response_time_ms}ms" "16776960"
        fi

        return 0
    else
        log_error "Health check failed (HTTP $http_code)"
        send_discord_alert "Application health check failed: HTTP $http_code"
        return 1
    fi
}

# Function to check Docker container
check_docker() {
    if command -v docker &> /dev/null; then
        local container_name="${1:-nextjs-app}"

        if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
            local status=$(docker inspect -f '{{.State.Status}}' "$container_name")
            local health=$(docker inspect -f '{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")

            if [ "$status" = "running" ]; then
                log "✅ Docker container '$container_name' is running"

                if [ "$health" != "no-healthcheck" ] && [ "$health" != "healthy" ]; then
                    log_error "Container '$container_name' health status: $health"
                    send_discord_alert "Container health check failed: $health"
                    return 1
                fi

                return 0
            else
                log_error "Container '$container_name' is not running (status: $status)"
                send_discord_alert "Docker container is not running: $status"
                return 1
            fi
        else
            log_error "Container '$container_name' not found"
            send_discord_alert "Docker container not found: $container_name"
            return 1
        fi
    fi

    return 0
}

# Function to check database
check_database() {
    if [ -n "$DATABASE_URL" ]; then
        if command -v psql &> /dev/null; then
            if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
                log "✅ Database connection successful"
                return 0
            else
                log_error "Database connection failed"
                send_discord_alert "Database connection failed"
                return 1
            fi
        fi
    fi

    return 0
}

# Function to check disk space
check_disk_space() {
    local threshold=90
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$usage" -gt "$threshold" ]; then
        log_error "Disk usage critical: ${usage}% (threshold: ${threshold}%)"
        send_discord_alert "⚠️ Disk usage critical: ${usage}%" "16776960"
        return 1
    else
        log "✅ Disk usage: ${usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory() {
    local threshold=90

    if command -v free &> /dev/null; then
        local usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')

        if [ "$usage" -gt "$threshold" ]; then
            log_error "Memory usage high: ${usage}% (threshold: ${threshold}%)"
            send_discord_alert "⚠️ Memory usage high: ${usage}%" "16776960"
            return 1
        else
            log "✅ Memory usage: ${usage}%"
            return 0
        fi
    fi

    return 0
}

# Main execution
main() {
    log "Starting health check..."

    local exit_code=0

    # Run checks
    check_http "$HEALTH_ENDPOINT" || exit_code=1
    check_docker "nextjs-app" || exit_code=1
    check_database || exit_code=1
    check_disk_space || exit_code=1
    check_memory || exit_code=1

    if [ $exit_code -eq 0 ]; then
        log "✅ All health checks passed"
    else
        log_error "⚠️ Some health checks failed"
    fi

    log "Health check completed"
    echo ""

    exit $exit_code
}

# Run main function
main
