# Smart Laundry System

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326ce5.svg)](https://kubernetes.io/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Microservices](https://img.shields.io/badge/architecture-microservices-orange.svg)](https://microservices.io/)

> 🚀 **Enterprise-grade smart laundry management platform** with AI/ML integration, blockchain payments, and IoT device management

## Table of Contents

- [Overview](#overview)
- [🎯 Key Features](#-key-features)
- [🏗️ Technology Stack](#️-technology-stack)
- [🏛️ Architecture](#️-architecture)
- [📁 Repository Structure](#-repository-structure)
- [✅ Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [📚 API Documentation](#-api-documentation)
- [🔄 Development Workflow](#-development-workflow)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## Overview

The **Smart Laundry System** is a comprehensive, enterprise-grade microservices platform that revolutionizes laundry facility management through intelligent automation, AI-powered insights, and seamless user experiences.

### 🌟 What Makes It Special

- **🎯 AI-Driven Operations**: Machine learning algorithms for demand forecasting and intelligent lost item matching
- **💰 Blockchain Payments**: Secure, transparent payment processing with cryptocurrency support
- **📱 Multi-Platform Access**: Beautiful web dashboard and mobile applications for all stakeholders
- **🏗️ Cloud-Native**: Built on modern microservices architecture with Kubernetes orchestration
- **🔗 IoT Integration**: Real-time device monitoring and management through MQTT
- **🔮 Digital Twin**: Advanced simulation and modeling with Azure Digital Twins and Unity

### 📸 Screenshots & Demos

> **🚧 Coming Soon**: Live demo links, screenshots, and video walkthroughs will be added as the project progresses.

<!--
Future additions:
- 🌐 [Live Demo](https://smart-laundry-demo.example.com)
- 📱 [Mobile App Preview](https://apps.example.com/smart-laundry)
- 🎥 [Video Walkthrough](https://youtu.be/example)
- 📊 [Admin Dashboard](https://dashboard.example.com)
-->

## 🎯 Key Features

### 🖥️ Frontend Applications
- **🌐 Web Dashboard**: Modern React-based administrative interface with TypeScript
- **📱 Mobile Application**: Cross-platform mobile client for iOS and Android
- **🎨 Modern UI/UX**: Responsive design with Tailwind CSS and shadcn/ui components

### ⚙️ Backend Services
- **🏗️ Microservices Architecture**: Scalable, maintainable service-oriented design
- **🔐 Authentication Service**: JWT-based authentication with role-based access control
- **🧺 Laundry Management**: Core business logic for machine booking and operations
- **📊 Reporting Service**: Advanced analytics and business intelligence

### 🤖 AI/ML Capabilities
- **📈 Demand Forecasting**: Predictive analytics for optimal resource allocation
- **🔍 Lost & Found Matching**: Computer vision for automatic item identification
- **🌐 Federated Learning**: Distributed machine learning across multiple facilities
- **📓 Research Notebooks**: Jupyter notebooks for data analysis and model development

### 💰 Payment & Blockchain
- **🔗 Blockchain Integration**: Secure, transparent payment processing
- **💳 Multiple Payment Methods**: Support for various payment options
- **🔒 Smart Contracts**: Automated payment and refund processing

### 🌐 IoT & Device Management
- **📡 MQTT Integration**: Real-time device communication and monitoring
- **🖥️ Edge Computing**: Local processing capabilities for IoT devices
- **⚡ Firmware Management**: Over-the-air updates and device configuration

### 🔮 Digital Twin & Simulation
- **☁️ Azure Digital Twins**: Real-time digital representation of physical assets
- **🎮 Unity Simulation**: 3D visualization and scenario modeling
- **📊 Real-time Monitoring**: Live facility status and performance metrics

### 🚀 DevOps & Infrastructure
- **🐳 Containerization**: Docker-based deployment with Kubernetes orchestration
- **🔄 CI/CD Pipeline**: Automated testing, building, and deployment
- **📈 Monitoring**: Comprehensive logging, metrics, and alerting
- **🏗️ Infrastructure as Code**: Terraform-managed cloud resources

## 🏗️ Technology Stack

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **React** | Web application framework | ^18.0 |
| 🔷 **TypeScript** | Type-safe JavaScript | ^5.0 |
| 🎨 **Tailwind CSS** | Utility-first CSS framework | ^3.0 |
| ⚡ **Vite** | Build tool and dev server | ^5.0 |
| 📱 **React Native** | Mobile application development | Latest |

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| 🟢 **Node.js** | JavaScript runtime | ^18.0 |
| 🔷 **TypeScript** | Type-safe JavaScript | ^5.0 |
| ⚡ **Express.js** | Web application framework | ^4.18 |
| 🗄️ **PostgreSQL** | Primary database | ^15.0 |
| 🔴 **Redis** | Caching and session storage | ^7.0 |

### AI/ML Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| 🐍 **Python** | ML development language | ^3.10 |
| 🧠 **TensorFlow** | Machine learning framework | ^2.13 |
| 🔬 **PyTorch** | Deep learning framework | ^2.0 |
| 📊 **Pandas** | Data manipulation | ^2.0 |
| 📈 **Scikit-learn** | Machine learning library | ^1.3 |

### Infrastructure & DevOps
| Technology | Purpose | Version |
|------------|---------|---------|
| 🐳 **Docker** | Containerization platform | ^20.10 |
| ☸️ **Kubernetes** | Container orchestration | ^1.28 |
| 🏗️ **Terraform** | Infrastructure as Code | ^1.5 |
| 🔧 **GitHub Actions** | CI/CD pipeline | Latest |
| ☁️ **Azure** | Cloud platform | Latest |

## 🏛️ Architecture

The system follows a **cloud-native microservices architecture** with event-driven communication and distributed data management.

### 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[🌐 Web Dashboard<br/>React + TypeScript]
        MOBILE[📱 Mobile App<br/>React Native]
        IOT[🔌 IoT Devices<br/>MQTT Clients]
    end

    subgraph "API Gateway Layer"
        GATEWAY[🚪 API Gateway<br/>Authentication & Routing]
    end

    subgraph "Microservices Layer"
        AUTH[🔐 Auth Service<br/>JWT + RBAC]
        LAUNDRY[🧺 Laundry Service<br/>Core Business Logic]
        PAYMENT[💰 Payment Service<br/>Blockchain Integration]
        NOTIFICATION[📢 Notification Service<br/>Multi-channel Alerts]
        LOSTFOUND[🔍 Lost & Found Service<br/>AI Vision Matching]
        REPORTING[📊 Reporting Service<br/>Analytics & BI]
    end

    subgraph "Data Layer"
        POSTGRES[(🗄️ PostgreSQL<br/>Primary Database)]
        REDIS[(🔴 Redis<br/>Cache & Sessions)]
        BLOCKCHAIN[⛓️ Blockchain<br/>Payment Ledger]
    end

    subgraph "AI/ML Layer"
        ML[🤖 ML Models<br/>Demand Forecasting]
        VISION[👁️ Computer Vision<br/>Item Recognition]
        FEDERATED[🌐 Federated Learning<br/>Distributed Training]
    end

    subgraph "Infrastructure Layer"
        MQTT[📡 MQTT Broker<br/>IoT Communication]
        TWINS[🔮 Digital Twins<br/>Azure DT + Unity]
        MONITOR[📈 Monitoring<br/>Logs & Metrics]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    IOT --> MQTT

    GATEWAY --> AUTH
    GATEWAY --> LAUNDRY
    GATEWAY --> PAYMENT
    GATEWAY --> NOTIFICATION
    GATEWAY --> LOSTFOUND
    GATEWAY --> REPORTING

    AUTH --> POSTGRES
    LAUNDRY --> POSTGRES
    PAYMENT --> BLOCKCHAIN
    NOTIFICATION --> REDIS
    LOSTFOUND --> VISION
    REPORTING --> POSTGRES

    LAUNDRY --> ML
    LOSTFOUND --> VISION
    ML --> FEDERATED

    MQTT --> TWINS
    ALL_SERVICES[All Services] --> MONITOR
```

### 🔄 Service Communication Patterns

- **🌐 Synchronous**: REST APIs for real-time requests
- **⚡ Asynchronous**: Event-driven messaging for background tasks
- **📡 Real-time**: WebSocket connections for live updates
- **🔗 Service Mesh**: Istio for secure service-to-service communication

## 📁 Repository Structure

```
smart-laundry-system/
├── 🌐 frontend/
│   ├── web/                    # React web application with TypeScript
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Application pages/routes
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── lib/            # Utility functions and configs
│   │   ├── public/             # Static assets
│   │   └── package.json        # Dependencies and scripts
│   └── mobile/                 # React Native mobile application
│       ├── src/                # Mobile app source code
│       └── package.json        # Mobile dependencies
├── ⚙️ backend/
│   ├── api-gateway/            # 🚪 Central API gateway service
│   ├── auth-service/           # 🔐 Authentication & authorization
│   ├── laundry-service/        # 🧺 Core business logic & operations
│   ├── lostfound-service/      # 🔍 AI-powered lost item matching
│   ├── notification-service/   # 📢 Multi-channel notifications
│   ├── payment-service/        # 💰 Blockchain payment processing
│   └── reporting-service/      # 📊 Analytics & business intelligence
├── 🤖 ai-ml/
│   ├── federated-learning/     # 🌐 Distributed ML across facilities
│   ├── laundry-demand-forecast/ # 📈 Predictive demand analytics
│   ├── lostfound-matching/     # 👁️ Computer vision algorithms
│   └── notebooks/              # 📓 Jupyter research notebooks
├── 🔮 digital-twin/
│   ├── azure-digital-twins/    # ☁️ Azure Digital Twins setup
│   ├── configs/                # 🔧 Twin configuration files
│   └── unity-simulation/       # 🎮 Unity 3D simulation assets
├── 🔌 iot/
│   ├── edge/                   # 🖥️ Edge computing components
│   ├── firmware/               # ⚙️ Device firmware & simulation
│   └── mqtt-broker/            # 📡 MQTT broker configuration
├── 🏗️ infra/
│   ├── docker-compose.yml      # 🐳 Local development stack
│   ├── k8s/                    # ☸️ Kubernetes deployment manifests
│   ├── terraform/              # 🏗️ Infrastructure as Code
│   └── ci-cd/                  # 🔄 CI/CD pipeline configurations
├── 🧪 tests/
│   ├── unit/                   # 🔬 Unit test suites
│   ├── integration/            # 🔗 Integration test scenarios
│   └── load/                   # 📈 Performance & load testing
├── 📋 scripts/                 # 🛠️ Deployment & utility scripts
├── 📚 docs/                    # 📖 Project documentation
└── 📄 README.md               # 👋 You are here!
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### 🔧 Core Requirements

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | ≥ 18.0.0 | JavaScript runtime | [Download](https://nodejs.org/) |
| **npm** | ≥ 8.0.0 | Package manager | Comes with Node.js |
| **Python** | ≥ 3.10 | AI/ML development | [Download](https://python.org/) |
| **Docker** | ≥ 20.10 | Containerization | [Download](https://docker.com/) |
| **Docker Compose** | ≥ 2.0 | Multi-container orchestration | Included with Docker |

### 🛠️ Development Tools (Recommended)

```bash
# Install Git (if not already installed)
winget install Git.Git

# Install VS Code
winget install Microsoft.VisualStudioCode

# Install useful VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-python.python
code --install-extension ms-azuretools.vscode-docker
```

### ☁️ Cloud Services (Optional)

- **Azure Account**: For Digital Twins and cloud deployment
- **GitHub Account**: For CI/CD and container registry
- **Domain & SSL**: For production deployment

## 🚀 Getting Started

### 🚀 Quick Start (5 minutes)

The fastest way to get the system running locally:

```bash
# 1. Clone the repository
git clone https://github.com/DevPrasath6/smart-laundry-system.git
cd smart-laundry-system

# 2. Start all services with Docker Compose
cd infra
docker-compose up --build

# 3. Access the applications
# Web Dashboard: http://localhost:3000
# API Gateway: http://localhost:8000
# MQTT Broker: localhost:1883
```

### 🎯 Development Setup (Recommended)

For active development with hot reload and debugging:

#### 1. 📦 Install Dependencies

```bash
# Frontend dependencies
cd frontend/web
npm ci

# Backend service dependencies (example with auth-service)
cd ../../backend/auth-service
npm ci

# Python/ML dependencies
cd ../../ai-ml
pip install -r requirements.txt
```

#### 2. 🔧 Environment Configuration

```bash
# Copy environment templates
cp .env.example .env

# Edit environment variables
# Configure database URLs, API keys, etc.
```

#### 3. 🗄️ Database Setup

```bash
# Start database services
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

#### 4. 🚀 Start Development Servers

```bash
# Terminal 1: Start the web application
cd frontend/web
npm run dev
# Access at http://localhost:5173

# Terminal 2: Start the API gateway
cd backend/api-gateway
npm run dev
# Access at http://localhost:8000

# Terminal 3: Start a specific service (e.g., auth)
cd backend/auth-service
npm run dev
# Access at http://localhost:3001
```

### ✅ Verify Installation

After setup, verify everything is working:

```bash
# Check web application
curl http://localhost:5173

# Check API gateway health
curl http://localhost:8000/health

# Check service status
docker-compose ps

# Run quick tests
npm run test:quick
```

### 🎯 Development Targets

| Component | URL | Purpose |
|-----------|-----|---------|
| 🌐 **Web Dashboard** | http://localhost:5173 | Admin interface |
| 📱 **Mobile Dev Server** | http://localhost:8081 | React Native Metro |
| 🚪 **API Gateway** | http://localhost:8000 | Main API endpoint |
| 🔐 **Auth Service** | http://localhost:3001 | Authentication API |
| 🧺 **Laundry Service** | http://localhost:3002 | Core business API |
| 📡 **MQTT Broker** | localhost:1883 | IoT device communication |
| 🗄️ **PostgreSQL** | localhost:5432 | Primary database |
| 🔴 **Redis** | localhost:6379 | Cache & sessions |

## 📚 API Documentation

### 🚪 API Gateway Endpoints

The main API gateway serves as the entry point for all client requests. All endpoints are prefixed with the service name.

#### 🔐 Authentication Endpoints

```http
POST   /auth/login              # User authentication
POST   /auth/register           # User registration
POST   /auth/refresh            # Token refresh
DELETE /auth/logout             # User logout
GET    /auth/profile            # Get user profile
PUT    /auth/profile            # Update user profile
```

#### 🧺 Laundry Service Endpoints

```http
GET    /laundry/machines        # List all machines
POST   /laundry/machines        # Add new machine
GET    /laundry/machines/:id    # Get machine details
PUT    /laundry/machines/:id    # Update machine
DELETE /laundry/machines/:id    # Remove machine

GET    /laundry/bookings        # List bookings
POST   /laundry/bookings        # Create booking
GET    /laundry/bookings/:id    # Get booking details
PUT    /laundry/bookings/:id    # Update booking
DELETE /laundry/bookings/:id    # Cancel booking
```

#### 💰 Payment Service Endpoints

```http
POST   /payment/process         # Process payment
GET    /payment/methods         # List payment methods
POST   /payment/methods         # Add payment method
GET    /payment/history         # Payment history
POST   /payment/refund          # Request refund
```

#### 🔍 Lost & Found Endpoints

```http
GET    /lostfound/items         # List lost items
POST   /lostfound/items         # Report lost item
POST   /lostfound/match         # AI-powered item matching
GET    /lostfound/matches/:id   # Get match results
PUT    /lostfound/claim/:id     # Claim found item
```

### 📖 Interactive Documentation

When running locally, access the interactive API documentation:

| Service | Swagger UI | OpenAPI Spec |
|---------|------------|--------------|
| 🚪 **API Gateway** | http://localhost:8000/docs | http://localhost:8000/api-docs.json |
| 🔐 **Auth Service** | http://localhost:3001/docs | http://localhost:3001/api-docs.json |
| 🧺 **Laundry Service** | http://localhost:3002/docs | http://localhost:3002/api-docs.json |
| 💰 **Payment Service** | http://localhost:3003/docs | http://localhost:3003/api-docs.json |

### 🔧 API Testing

```bash
# Test API health
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Test with authentication token
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/laundry/machines
```

### 📡 WebSocket Events

Real-time events for live updates:

```javascript
// Machine status updates
ws://localhost:8000/ws/machines

// Booking notifications
ws://localhost:8000/ws/bookings

// Payment confirmations
ws://localhost:8000/ws/payments
```

## 🔄 Development Workflow

### Environment Configuration

1. Copy environment templates:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables according to your development setup.

### Code Standards

- **Frontend**: ESLint and Prettier configuration
- **Backend**: Service-specific linting rules
- **Python/ML**: PEP 8 compliance with Black formatter

### Version Control

- Feature branches should be created from `main`
- Pull requests require code review and passing CI checks
- Commit messages should follow conventional commit standards

## Testing

### Unit Tests

Execute unit tests for individual services:

```bash
# Frontend
cd frontend/web && npm test

# Backend service
cd backend/auth-service && npm test

# Python/ML
cd ai-ml/laundry-demand-forecast && pytest
```

### Integration Tests

Run integration tests against the full stack:

```bash
cd tests/integration
npm test
```

### Load Testing

Performance testing using k6:

```bash
cd tests/load
k6 run performance-test.js
```

## 🚢 Deployment

### 🏠 Local Development

```bash
# Start all services locally
cd infra
docker-compose up -d

# Monitor logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 🧪 Staging Environment

```bash
# Deploy to staging using Kubernetes
kubectl apply -f infra/k8s/staging/

# Check deployment status
kubectl get pods -n smart-laundry-staging

# View service logs
kubectl logs -f deployment/api-gateway -n smart-laundry-staging
```

### 🚀 Production Deployment

#### Prerequisites

- **Kubernetes Cluster**: Version 1.28+
- **Container Registry**: GitHub Container Registry or Azure Container Registry
- **Domain Name**: With SSL certificate
- **Database**: Managed PostgreSQL (Azure Database, AWS RDS, etc.)
- **Redis Cache**: Managed Redis instance
- **Storage**: Object storage for file uploads

#### Deployment Steps

1. **Infrastructure Setup**
   ```bash
   # Initialize Terraform
   cd infra/terraform
   terraform init

   # Plan infrastructure changes
   terraform plan -var-file="production.tfvars"

   # Apply infrastructure
   terraform apply -var-file="production.tfvars"
   ```

2. **Container Images**
   ```bash
   # Build and push images (automated via GitHub Actions)
   docker build -t ghcr.io/devprasath6/smart-laundry/api-gateway:latest ./backend/api-gateway
   docker push ghcr.io/devprasath6/smart-laundry/api-gateway:latest
   ```

3. **Kubernetes Deployment**
   ```bash
   # Apply production manifests
   kubectl apply -f infra/k8s/production/

   # Verify deployment
   kubectl get all -n smart-laundry-prod
   ```

4. **Database Migration**
   ```bash
   # Run database migrations
   kubectl exec -it deployment/migration-job -n smart-laundry-prod -- npm run db:migrate
   ```

### 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment:

#### Workflow Triggers
- **Pull Request**: Run tests and security scans
- **Main Branch**: Deploy to staging environment
- **Release Tag**: Deploy to production environment

#### Pipeline Stages

```yaml
# .github/workflows/deploy.yml
name: Deploy Smart Laundry System

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
      - name: Security Scan
      - name: Code Quality Check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Images
      - name: Push to Registry

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
      - name: Run Integration Tests
```

### 📊 Monitoring & Observability

#### Metrics Collection
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization dashboards
- **Jaeger**: Distributed tracing

#### Logging
- **ELK Stack**: Elasticsearch, Logstash, and Kibana
- **Fluentd**: Log forwarding and aggregation

#### Health Checks
```bash
# Check service health
curl https://api.smart-laundry.com/health

# Check database connectivity
kubectl exec -it deployment/api-gateway -- npm run health:db

# Monitor resource usage
kubectl top pods -n smart-laundry-prod
```

### 🔧 Environment Configuration

#### Production Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@db.smart-laundry.com:5432/smart_laundry
REDIS_URL=redis://cache.smart-laundry.com:6379

# Authentication
JWT_SECRET=your-super-secure-secret
JWT_EXPIRES_IN=24h

# Services
API_GATEWAY_URL=https://api.smart-laundry.com
WEB_APP_URL=https://dashboard.smart-laundry.com

# Third-party Services
AZURE_DIGITAL_TWINS_URL=https://smart-laundry.api.wus2.digitaltwins.azure.net
BLOCKCHAIN_NETWORK_URL=https://mainnet.infura.io/v3/your-project-id

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key
```

### 🔐 Security Considerations

- **TLS/SSL**: HTTPS for all external communications
- **Network Policies**: Kubernetes network policies for service isolation
- **Secrets Management**: Azure Key Vault or AWS Secrets Manager
- **Image Scanning**: Container vulnerability scanning in CI/CD
- **RBAC**: Role-based access control for Kubernetes resources

### 📈 Scaling & Performance

#### Horizontal Pod Autoscaling (HPA)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### Database Scaling
- **Read Replicas**: For improved read performance
- **Connection Pooling**: PgBouncer for PostgreSQL
- **Caching Strategy**: Redis for frequently accessed data

## 🛠️ Troubleshooting

### 🚨 Common Issues & Solutions

#### 🐳 Docker & Container Issues

**Problem**: Docker containers won't start or crash immediately

```bash
# Check container logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart <service-name>

# Clean rebuild
docker-compose down
docker-compose up --build
```

**Problem**: Port already in use
```bash
# Find process using port
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Or use different ports in docker-compose.yml
```

#### 🗄️ Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U smart_laundry -d smart_laundry_db

# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
```

**Problem**: Database migrations fail
```bash
# Check migration status
npm run db:status

# Rollback last migration
npm run db:rollback

# Force migration
npm run db:migrate --force
```

#### 🔐 Authentication Issues

**Problem**: JWT token errors

```bash
# Check JWT secret configuration
echo $JWT_SECRET

# Verify token expiration settings
# In .env file: JWT_EXPIRES_IN=24h

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

**Problem**: CORS errors in development
```bash
# Update CORS settings in api-gateway/src/app.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

#### 📱 Frontend Issues

**Problem**: React development server won't start

```bash
# Clear node_modules and reinstall
cd frontend/web
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be >= 18

# Try different port
npm run dev -- --port 3001
```

**Problem**: Build failures
```bash
# Check for TypeScript errors
npm run type-check

# Fix ESLint issues
npm run lint --fix

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### 🔌 IoT & MQTT Issues

**Problem**: MQTT broker connection failed

```bash
# Check MQTT broker status
docker-compose logs mqtt-broker

# Test MQTT connection
mosquitto_pub -h localhost -p 1883 -t test/topic -m "hello"
mosquitto_sub -h localhost -p 1883 -t test/topic

# Check firewall settings (Windows)
netsh advfirewall firewall show rule name="MQTT"
```

#### 🤖 AI/ML Service Issues

**Problem**: Python dependencies not installing

```bash
# Use virtual environment
cd ai-ml
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install with specific Python version
pip install -r requirements.txt --python=python3.10
```

**Problem**: TensorFlow/PyTorch issues
```bash
# Check GPU availability
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"

# Use CPU version if GPU issues persist
pip install tensorflow-cpu
```

### 🔍 Debugging Tips

#### Enable Debug Logging

```bash
# Environment variables for debugging
DEBUG=smart-laundry:*
LOG_LEVEL=debug
NODE_ENV=development
```

#### Service Health Checks

```bash
# Check all service health
curl http://localhost:8000/health
curl http://localhost:3001/health  # Auth service
curl http://localhost:3002/health  # Laundry service

# Check database connectivity
curl http://localhost:8000/health/db

# Check external dependencies
curl http://localhost:8000/health/external
```

#### Performance Monitoring

```bash
# Monitor container resources
docker stats

# Check memory usage
docker-compose exec api-gateway top

# Monitor database performance
docker-compose exec postgres pg_stat_activity
```

### 📊 Log Analysis

#### Centralized Logging

```bash
# View aggregated logs
docker-compose logs -f --tail=100

# Filter by service
docker-compose logs -f api-gateway

# Search logs for errors
docker-compose logs | grep ERROR

# Export logs to file
docker-compose logs > debug-logs.txt
```

#### Common Log Patterns

```bash
# Database connection errors
grep "ECONNREFUSED" logs/

# Authentication failures
grep "401\|403\|Unauthorized" logs/

# API rate limiting
grep "429\|Too Many Requests" logs/

# Memory issues
grep "Out of memory\|ENOMEM" logs/
```

### 🆘 Emergency Procedures

#### System Recovery

```bash
# Emergency stop all services
docker-compose down --remove-orphans

# Clear all data and restart fresh
docker-compose down -v
docker system prune -a
docker-compose up --build

# Backup database before reset
docker-compose exec postgres pg_dump -U smart_laundry smart_laundry_db > backup.sql
```

#### Data Recovery

```bash
# Restore database from backup
docker-compose exec -T postgres psql -U smart_laundry smart_laundry_db < backup.sql

# Check data integrity
docker-compose exec postgres psql -U smart_laundry -c "SELECT COUNT(*) FROM users;"
```

### 📞 Getting Help

#### Support Channels

- **GitHub Issues**: [Report bugs and request features](https://github.com/DevPrasath6/smart-laundry-system/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/DevPrasath6/smart-laundry-system/discussions)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Stack Overflow**: Tag questions with `smart-laundry-system`

#### Bug Report Template

```markdown
**Environment:**
- OS: [Windows/Mac/Linux]
- Docker version: [version]
- Node.js version: [version]
- Python version: [version]

**Issue Description:**
[Describe the problem]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Logs:**
[Relevant log output]

**Additional Context:**
[Any other relevant information]
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or reporting issues, your help makes this project better.

### 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Report issues and help us fix them
- ✨ **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Submit bug fixes and new features
- 📖 **Documentation**: Improve README, guides, and code comments
- 🧪 **Testing**: Write tests and improve test coverage
- 🎨 **Design**: Contribute UI/UX improvements
- 🌐 **Translation**: Help internationalize the application

### 🚀 Getting Started

#### 1. 🍴 Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/smart-laundry-system.git
cd smart-laundry-system

# Add upstream remote
git remote add upstream https://github.com/DevPrasath6/smart-laundry-system.git
```

#### 2. 🔧 Development Environment

```bash
# Install dependencies
npm run install:all

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development environment
docker-compose up -d
npm run dev
```

#### 3. 🌿 Create Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 📝 Development Guidelines

#### Code Style

**Frontend (React/TypeScript)**
```bash
# Use Prettier and ESLint
npm run lint
npm run format

# TypeScript strict mode
npm run type-check
```

**Backend (Node.js/TypeScript)**
```bash
# Follow Airbnb style guide
npm run lint:backend
npm run format:backend

# API documentation
npm run docs:generate
```

**Python (AI/ML)**
```bash
# Follow PEP 8 with Black
pip install black flake8 mypy
black .
flake8 .
mypy .
```

#### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat(auth): add two-factor authentication"

# Bug fix
git commit -m "fix(api): resolve memory leak in payment service"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(database): optimize query performance"

# Test
git commit -m "test(auth): add unit tests for login flow"
```

#### Testing Requirements

```bash
# Run all tests before submitting
npm run test:all

# Frontend tests
cd frontend/web && npm test

# Backend tests
cd backend/auth-service && npm test

# Integration tests
npm run test:integration

# Ensure coverage > 80%
npm run test:coverage
```

### 🔄 Pull Request Process

#### 1. 📋 Pre-submission Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log/debug statements
- [ ] Environment variables documented
- [ ] Breaking changes documented

#### 2. 📤 Submit Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR from GitHub interface
# Fill out the PR template completely
```

#### 3. 🔍 Review Process

- **Automated Checks**: All CI checks must pass
- **Code Review**: At least one maintainer approval required
- **Testing**: Integration tests run on PR
- **Documentation**: Updates reviewed for clarity

### 🏗️ Project Structure

When contributing, understand the project architecture:

```
├── frontend/web/src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript definitions
├── backend/*/src/
│   ├── routes/         # API route handlers
│   ├── models/         # Data models
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
```

### 🧪 Testing Strategy

#### Unit Tests
- Cover individual functions/components
- Mock external dependencies
- Test edge cases and error conditions

#### Integration Tests
- Test API endpoints end-to-end
- Verify service interactions
- Database operations

#### E2E Tests
- User journey testing
- Cross-browser compatibility
- Performance benchmarks

### 🔒 Security Guidelines

#### Code Security
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all inputs
- Follow OWASP guidelines

#### Dependency Security
```bash
# Check for vulnerabilities
npm audit
pip safety check

# Update dependencies regularly
npm update
pip-review --local --interactive
```

### 📋 Issue Guidelines

#### Bug Reports

Use the bug report template:
```markdown
**Bug Description**
Clear description of the issue

**Environment**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Node.js: [version]
- Docker: [version]

**Reproduction Steps**
1. Step 1
2. Step 2
3. Step 3

**Expected vs Actual Behavior**
What should happen vs what actually happens

**Logs/Screenshots**
Include relevant error messages or screenshots
```

#### Feature Requests

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

### 🏆 Recognition

Contributors are recognized in:
- **Contributors List**: GitHub contributors page
- **Release Notes**: Major contributions mentioned
- **Hall of Fame**: Outstanding contributors featured

### 📞 Getting Help

- **💬 Discussions**: [GitHub Discussions](https://github.com/DevPrasath6/smart-laundry-system/discussions)
- **🐛 Issues**: [GitHub Issues](https://github.com/DevPrasath6/smart-laundry-system/issues)
- **📧 Email**: [Contact maintainers](mailto:devprasath6@example.com)
- **💬 Discord**: [Community Chat](https://discord.gg/smart-laundry) *(Coming Soon)*

### 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

**In Summary:**
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### 🎯 Good First Issues

New contributors should look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Community help appreciated
- `documentation` - Documentation improvements
- `frontend` / `backend` - Technology-specific issues

### 🚀 Advanced Contributing

#### Becoming a Maintainer

Regular contributors may be invited to become maintainers with:
- Commit access to main repository
- Ability to review and merge PRs
- Participation in project direction decisions

#### Release Process

Maintainers handle releases:
1. Version bump following semver
2. Update changelog
3. Create release notes
4. Deploy to staging/production
5. Announce release

## 📄 License

This project is licensed under the terms specified in the `LICENSE` file located in the project root directory.

---

**Note**: For detailed service-specific documentation, refer to the README files in individual service directories.
