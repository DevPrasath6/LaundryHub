# 🏆 Smart Laundry System - ADYA

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Microservices](https://img.shields.io/badge/architecture-microservices-orange.svg)](https://microservices.io/)

> 🚀 **Enterprise-grade smart laundry management platform** with AI/ML integration, blockchain payments, and IoT device management

**🎯 Hackathon Ready** | **⚡ Production Grade** | **🤖 AI-Powered** | **🔗 IoT Connected**

---

## 🌟 What Makes It Special

Our Smart Laundry System represents the next generation of facility management, combining cutting-edge technologies to create an intelligent, automated, and user-friendly platform.

### 🎯 Key Innovations

- **🧠 AI-Driven Intelligence**: Machine learning for demand forecasting and computer vision for lost item matching
- **💎 Blockchain Integration**: Secure, transparent payments with cryptocurrency support
- **📱 Omnichannel Experience**: Beautiful web dashboard and mobile applications
- **🏗️ Cloud-Native Architecture**: Microservices with Kubernetes orchestration
- **🔗 IoT Ecosystem**: Real-time device monitoring through MQTT
- **🔮 Digital Twin Simulation**: Advanced modeling with Azure Digital Twins

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ with pip
- Docker and Docker Compose
- Git

### ⚡ One-Command Setup

```bash
# Clone the repository
git clone https://github.com/DevPrasath6/SmartLaundrySystem-ADYA.git
cd SmartLaundrySystem-ADYA

# Configure professional commit hooks
git config core.hooksPath .githooks

# Start the complete system
./scripts/deploy.sh deploy

# Seed demo data
npm run seed
```

### 🎯 Access Points

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Admin Dashboard**: http://localhost:5173/admin

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  React Web App  │  Mobile App  │  Admin Dashboard  │  Kiosk UI  │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                             │
│               Authentication │ Rate Limiting │ Routing          │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Microservices Layer                        │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Auth Service │Laundry Service│Payment Service│Notification Service│
├──────────────┼──────────────┼──────────────┼───────────────────┤
│Lost & Found  │  Reporting   │   AI/ML      │     IoT Edge      │
│   Service    │   Service    │  Services    │    Management     │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Data & Infrastructure                       │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│   MongoDB    │    Redis     │  Azure IoT   │   Azure Digital   │
│   Database   │    Cache     │     Hub      │      Twins        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features

### 🤖 AI & Machine Learning
- **Demand Forecasting**: Ensemble ML models predict peak usage times
- **Smart Scheduling**: AI-optimized machine allocation
- **Lost Item Matching**: Computer vision for automatic item identification
- **Predictive Maintenance**: IoT sensor analysis for equipment health

### 💰 Payment & Blockchain
- **Multi-Payment Support**: Credit cards, digital wallets, crypto
- **Blockchain Transparency**: Immutable transaction records
- **Automated Refunds**: Smart contract-based refund processing
- **Loyalty Programs**: Token-based reward systems

### 📊 Management Dashboard
- **Real-time Analytics**: Live usage statistics and trends
- **Machine Monitoring**: Status tracking and maintenance alerts
- **User Management**: Customer accounts and staff operations
- **Revenue Insights**: Financial reporting and forecasting

### 🔗 IoT Integration
- **Device Communication**: MQTT protocol for real-time updates
- **Sensor Networks**: Temperature, humidity, vibration monitoring
- **Remote Control**: Start/stop machines and adjust settings
- **Edge Computing**: Local processing for reduced latency

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern component-based UI
- **TypeScript** - Type-safe development
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Enhanced JavaScript
- **MongoDB** - NoSQL database
- **Redis** - In-memory caching
- **JWT** - Secure authentication

### AI/ML
- **Python 3.10+** - Core language
- **TensorFlow** - Deep learning framework
- **PyTorch** - Neural network library
- **scikit-learn** - Machine learning algorithms
- **OpenCV** - Computer vision processing

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration (production)
- **MQTT** - IoT messaging protocol
- **Azure IoT Hub** - Cloud IoT platform
- **Azure Digital Twins** - Digital modeling

---

## 📁 Project Structure

```
smart-laundry-system/
├── 📱 frontend/
│   ├── web/                 # React web application
│   └── mobile/              # React Native mobile app
├── 🔧 backend/
│   ├── api-gateway/         # Central API routing
│   ├── auth-service/        # Authentication & authorization
│   ├── laundry-service/     # Core laundry operations
│   ├── payment-service/     # Payment processing
│   ├── notification-service/# Multi-channel notifications
│   ├── lostfound-service/   # Lost item management
│   └── reporting-service/   # Analytics & reporting
├── 🤖 ai-ml/
│   ├── demand-forecast/     # ML demand prediction
│   ├── lostfound-matching/  # Computer vision matching
│   └── notebooks/           # Jupyter research notebooks
├── 🌐 iot/
│   ├── edge/                # Edge device simulators
│   ├── firmware/            # Device firmware simulation
│   └── mqtt-broker/         # Message broker setup
├── 🔮 digital-twin/
│   ├── azure-digital-twins/ # Cloud twin models
│   └── unity-simulation/    # 3D visualization
├── 🚀 infra/
│   └── docker-compose.yml   # Service orchestration
├── 📋 scripts/
│   ├── deploy.sh           # Deployment automation
│   └── seed-data.js        # Database initialization
└── 🧪 tests/
    ├── unit/               # Unit test suites
    ├── integration/        # Integration tests
    └── load/               # Performance tests
```

---

## 🔧 Development Workflow

### Setting Up Development Environment

1. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit with your settings
   nano .env
   ```

2. **Install Dependencies**
   ```bash
   # Install all service dependencies
   npm run install:all
   
   # Install Python ML dependencies
   pip install -r ai-ml/requirements.txt
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB and Redis
   docker-compose up -d mongodb redis
   
   # Seed initial data
   npm run seed
   ```

### Development Commands

```bash
# Start all services in development mode
npm run dev

# Start individual services
npm run dev:frontend        # React web app
npm run dev:backend         # All backend services
npm run dev:ml              # Python ML services

# Build for production
npm run build

# Run tests
npm run test                # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
```

### Git Workflow

This project enforces professional commit standards for hackathon submission:

```bash
# Configure commit hooks
git config core.hooksPath .githooks

# Example good commit messages
git commit -m "feat(auth): implement JWT refresh token mechanism"
git commit -m "fix(booking): resolve timezone calculation bug"
git commit -m "docs: update API documentation for payment endpoints"
```

---

## 🚢 Deployment

### Development Deployment

```bash
# Start all services with Docker
./scripts/deploy.sh deploy

# Individual deployment steps
./scripts/deploy.sh build     # Build Docker images
./scripts/deploy.sh start     # Start services
./scripts/deploy.sh health    # Check service health
./scripts/deploy.sh logs      # View aggregated logs
```

### Production Deployment

1. **Infrastructure Setup**
   ```bash
   # Azure resources (example)
   az group create --name smart-laundry-rg --location eastus
   az aks create --resource-group smart-laundry-rg --name smart-laundry-cluster
   ```

2. **Kubernetes Deployment**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f infra/k8s/
   
   # Monitor deployment
   kubectl get pods -n smart-laundry
   ```

3. **Domain & SSL Setup**
   ```bash
   # Configure ingress and certificates
   kubectl apply -f infra/k8s/ingress.yml
   ```

---

## 📊 API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

### Booking Endpoints

```http
GET    /api/bookings                # List user bookings
POST   /api/bookings                # Create new booking
GET    /api/bookings/:id            # Get booking details
PUT    /api/bookings/:id            # Update booking
DELETE /api/bookings/:id            # Cancel booking
```

### Machine Management

```http
GET    /api/machines                # List all machines
GET    /api/machines/:id            # Machine details
PUT    /api/machines/:id/status     # Update machine status
GET    /api/machines/available      # Available machines
```

### Payment Processing

```http
POST   /api/payments/charge         # Process payment
POST   /api/payments/refund         # Issue refund
GET    /api/payments/history        # Payment history
POST   /api/payments/crypto         # Crypto payment
```

---

## 🧪 Testing

### Test Coverage

- **Unit Tests**: 85%+ coverage for business logic
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Critical user journeys
- **Load Tests**: Performance under stress

### Running Tests

```bash
# All tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specific test suites
npm run test:auth           # Authentication tests
npm run test:booking        # Booking system tests
npm run test:payment        # Payment processing tests
```

### Test Data

```bash
# Reset test database
npm run test:reset

# Generate test data
npm run test:seed

# Performance testing
npm run test:load
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue**: Services not starting
```bash
# Check Docker status
docker ps
docker-compose logs

# Restart services
./scripts/deploy.sh restart
```

**Issue**: Database connection errors
```bash
# Verify MongoDB is running
docker exec -it mongodb mongosh

# Check connection string in .env
echo $MONGODB_URI
```

**Issue**: Frontend build failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

### Performance Optimization

```bash
# Monitor resource usage
docker stats

# Database optimization
npm run db:optimize

# Cache warming
npm run cache:warm
```

---

## 🤝 Contributing

### Development Standards

1. **Code Quality**
   - ESLint and Prettier for formatting
   - TypeScript strict mode
   - 100% test coverage for new features

2. **Commit Standards**
   - Professional commit messages
   - No WIP or temporary commits
   - Signed commits preferred

3. **Review Process**
   - All changes via pull requests
   - Required approvals for main branch
   - Automated CI/CD checks

### Getting Started

```bash
# Fork the repository
gh repo fork DevPrasath6/SmartLaundrySystem-ADYA

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git commit -m "feat(scope): your professional message"

# Push and create PR
git push origin feature/your-feature-name
gh pr create
```

---

## 📈 Roadmap

### Phase 1 (Hackathon) ✅
- [x] Core microservices architecture
- [x] Basic AI/ML integration
- [x] Payment processing
- [x] Web dashboard
- [x] IoT simulation

### Phase 2 (Production)
- [ ] Mobile application release
- [ ] Advanced AI features
- [ ] Kubernetes deployment
- [ ] Multi-tenant support
- [ ] Advanced analytics

### Phase 3 (Scale)
- [ ] Global deployment
- [ ] Partnership integrations
- [ ] Enterprise features
- [ ] White-label solutions

---

## 🏆 Hackathon Highlights

### Technical Excellence
- **Microservices Architecture**: Scalable, maintainable system design
- **AI/ML Integration**: Real-world machine learning applications
- **Modern Tech Stack**: Latest technologies and best practices
- **Production Ready**: Docker, monitoring, and deployment automation

### Innovation Factor
- **Blockchain Payments**: Cryptocurrency integration for modern users
- **Computer Vision**: AI-powered lost item matching
- **IoT Integration**: Real-time device monitoring and control
- **Digital Twin**: Advanced simulation and modeling

### Business Impact
- **Operational Efficiency**: Reduced manual tasks through automation
- **Customer Experience**: Seamless booking and payment processes
- **Revenue Optimization**: AI-driven demand forecasting
- **Sustainability**: Optimized resource usage and energy efficiency

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with 🚀 for the future of laundry management

</div>
