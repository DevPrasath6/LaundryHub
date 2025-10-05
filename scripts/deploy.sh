#!/bin/bash

# Smart Laundry System Deployment Script
# This script handles the deployment of the entire smart laundry system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="smart-laundry-system"
DOCKER_COMPOSE_FILE="infra/docker-compose.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    log_info "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    log_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    log_info "Checking Docker Compose availability..."

    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi

    log_success "Docker Compose is available"
}

# Check if environment file exists
check_env_file() {
    log_info "Checking environment configuration..."

    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example "$ENV_FILE"
            log_success "Environment file created from template"
            log_warning "Please review and update $ENV_FILE with your configuration"
        else
            log_error "No environment template found. Please create $ENV_FILE manually."
            exit 1
        fi
    else
        log_success "Environment file found"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."

    # Install root dependencies
    if [ -f "package.json" ]; then
        log_info "Installing root package dependencies..."
        npm install
    fi

    # Install backend service dependencies
    for service in backend/*/; do
        if [ -f "$service/package.json" ]; then
            log_info "Installing dependencies for $(basename "$service")..."
            (cd "$service" && npm install)
        fi
    done

    # Install frontend dependencies
    if [ -f "frontend/web/package.json" ]; then
        log_info "Installing frontend dependencies..."
        (cd frontend/web && npm install)
    fi

    # Install AI/ML dependencies
    if [ -f "ai-ml/requirements.txt" ]; then
        log_info "Installing AI/ML dependencies..."
        if command -v python3 &> /dev/null; then
            python3 -m pip install -r ai-ml/requirements.txt
        elif command -v python &> /dev/null; then
            python -m pip install -r ai-ml/requirements.txt
        else
            log_warning "Python not found. Skipping AI/ML dependencies."
        fi
    fi

    log_success "Dependencies installed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."

    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" build --parallel

    log_success "Docker images built successfully"
}

# Start services
start_services() {
    log_info "Starting services..."

    # Start infrastructure services first
    log_info "Starting infrastructure services..."
    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" up -d mongodb redis mqtt-broker

    # Wait for infrastructure to be ready
    log_info "Waiting for infrastructure services to be ready..."
    sleep 10

    # Start application services
    log_info "Starting application services..."
    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" up -d

    log_success "All services started"
}

# Check service health
check_health() {
    log_info "Checking service health..."

    # Wait for services to fully start
    sleep 30

    # Check if services are running
    services=("mongodb" "redis" "api-gateway" "auth-service" "laundry-service" "payment-service" "notification-service")

    for service in "${services[@]}"; do
        if $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running properly"
        fi
    done

    # Check API endpoints
    log_info "Checking API endpoints..."

    # API Gateway health check
    if curl -s http://localhost:3000/health > /dev/null; then
        log_success "API Gateway is responding"
    else
        log_warning "API Gateway health check failed"
    fi

    # Auth service health check
    if curl -s http://localhost:3001/health > /dev/null; then
        log_success "Auth Service is responding"
    else
        log_warning "Auth Service health check failed"
    fi
}

# Setup database
setup_database() {
    log_info "Setting up database..."

    # Wait for MongoDB to be ready
    log_info "Waiting for MongoDB to be ready..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            log_success "MongoDB is ready"
            break
        fi

        attempt=$((attempt + 1))
        log_info "Waiting for MongoDB... (attempt $attempt/$max_attempts)"
        sleep 2
    done

    if [ $attempt -eq $max_attempts ]; then
        log_error "MongoDB failed to start properly"
        exit 1
    fi

    # Run database migrations (if script exists)
    if [ -f "scripts/db-migrate.sh" ]; then
        log_info "Running database migrations..."
        bash scripts/db-migrate.sh
    fi

    # Seed initial data (if script exists)
    if [ -f "scripts/seed-data.js" ]; then
        log_info "Seeding initial data..."
        node scripts/seed-data.js
    fi

    log_success "Database setup completed"
}

# Display deployment information
show_deployment_info() {
    log_success "Deployment completed successfully!"
    echo ""
    echo "Service URLs:"
    echo "  Frontend:           http://localhost:5173"
    echo "  API Gateway:        http://localhost:3000"
    echo "  Auth Service:       http://localhost:3001"
    echo "  Laundry Service:    http://localhost:3002"
    echo "  Payment Service:    http://localhost:3003"
    echo "  Notification Service: http://localhost:3004"
    echo ""
    echo "Infrastructure:"
    echo "  MongoDB:            mongodb://localhost:27017"
    echo "  Redis:              redis://localhost:6379"
    echo "  MQTT Broker:        mqtt://localhost:1883"
    echo ""
    echo "Management Commands:"
    echo "  View logs:          $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE logs -f"
    echo "  Stop services:      $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE down"
    echo "  Restart services:   $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE restart"
    echo "  Scale services:     $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE up -d --scale <service>=<count>"
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Stopping services..."
    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" down
    log_success "Services stopped"
}

# Help function
show_help() {
    echo "Smart Laundry System Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy      Full deployment (default)"
    echo "  start       Start services"
    echo "  stop        Stop services"
    echo "  restart     Restart services"
    echo "  build       Build Docker images"
    echo "  logs        Show service logs"
    echo "  health      Check service health"
    echo "  cleanup     Stop services and remove containers"
    echo "  help        Show this help message"
    echo ""
}

# Main deployment function
deploy() {
    log_info "Starting Smart Laundry System deployment..."

    check_docker
    check_docker_compose
    check_env_file
    install_dependencies
    build_images
    start_services
    setup_database
    check_health
    show_deployment_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "start")
        check_docker
        check_docker_compose
        start_services
        ;;
    "stop")
        check_docker_compose
        $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" down
        log_success "Services stopped"
        ;;
    "restart")
        check_docker_compose
        $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" restart
        log_success "Services restarted"
        ;;
    "build")
        check_docker
        check_docker_compose
        build_images
        ;;
    "logs")
        check_docker_compose
        $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" logs -f
        ;;
    "health")
        check_health
        ;;
    "cleanup")
        check_docker_compose
        $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" down -v --remove-orphans
        log_success "Cleanup completed"
        ;;
    "help")
        show_help
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

# Set up signal handlers for cleanup
trap cleanup EXIT INT TERM
