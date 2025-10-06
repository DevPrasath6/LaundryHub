# Frontend-Backend Connection Guide

This guide will help you connect the frontend React application to the backend microservices.

## 🚀 Quick Setup

### 1. Start Backend Services

#### Option A: Using Windows (Recommended for Windows users)
```bash
# Navigate to the project root
cd "Laundry System"

# Run the startup script
scripts\start-dev.bat
```

#### Option B: Using Linux/Mac
```bash
# Navigate to the project root
cd "Laundry System"

# Make script executable
chmod +x scripts/start-dev.sh

# Run the startup script
./scripts/start-dev.sh
```

#### Option C: Manual Start (if scripts don't work)
```bash
# Terminal 1 - API Gateway
cd backend/api-gateway
npm install
npm start

# Terminal 2 - Auth Service
cd backend/auth-service
npm install
npm start

# Terminal 3 - Laundry Service
cd backend/laundry-service
npm install
npm start

# Terminal 4 - Payment Service
cd backend/payment-service
npm install
npm start

# Terminal 5 - Notification Service
cd backend/notification-service
npm install
npm start

# Terminal 6 - Lost & Found Service
cd backend/lostfound-service
npm install
npm start

# Terminal 7 - Reporting Service
cd backend/reporting-service
npm install
npm start
```

### 2. Start Frontend

```bash
# Navigate to frontend directory
cd frontend/web

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

The frontend uses environment variables to connect to backend services:

**Development (`.env.development`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3000
```

**Production (`.env.production`):**
```env
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_API_GATEWAY_URL=https://your-domain.com
VITE_WEBSOCKET_URL=wss://your-domain.com
```

### Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 8080 | http://localhost:8080 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Laundry Service | 3002 | http://localhost:3002 |
| Payment Service | 3003 | http://localhost:3003 |
| Notification Service | 3004 | http://localhost:3004 |
| Lost & Found Service | 3005 | http://localhost:3005 |
| Reporting Service | 3006 | http://localhost:3006 |

## 🧪 Testing the Connection

### 1. Visual Connection Test

Visit the test page: http://localhost:8080/test

This page will show you the status of all backend services in real-time.

### 2. Manual API Testing

#### Check API Gateway Health
```bash
curl http://localhost:3000/health
```

#### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test Laundry Service
```bash
# Get laundry overview (requires authentication)
curl -X GET http://localhost:3000/api/v1/laundry/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Browser Console Testing

Open browser developer tools and run:

```javascript
// Test API connection
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('API Gateway:', data));

// Test with the API client
import { apiClient } from './lib/api/client';
apiClient.get('/health').then(console.log);
```

## 🔧 API Client Usage

### Basic Usage

```typescript
import {
  AuthService,
  LaundryService,
  PaymentService
} from '@/lib/services';

// Login
const loginResponse = await AuthService.login({
  email: 'user@example.com',
  password: 'password'
});

// Get machines
const machinesResponse = await LaundryService.getMachines();

// Create booking
const bookingResponse = await LaundryService.createBooking({
  machineId: 'machine-123',
  startTime: '2025-10-06T10:00:00Z',
  duration: 60 // minutes
});
```

### With React Hooks

```typescript
import { useProfile, useMachines, useCreateBooking } from '@/lib/hooks';

function BookingComponent() {
  const { data: profile } = useProfile();
  const { data: machines, isLoading } = useMachines({ type: 'washer' });
  const createBooking = useCreateBooking();

  const handleBooking = (machineId: string) => {
    createBooking.mutate({
      machineId,
      startTime: new Date().toISOString(),
      duration: 60
    });
  };

  // ... component logic
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to backend"
- Ensure all backend services are running
- Check if ports are available (not blocked by firewall)
- Verify environment variables are correct

#### 2. "CORS errors"
- API Gateway is configured for CORS, but ensure frontend runs on http://localhost:8080
- Check CORS_ORIGIN environment variable in API Gateway

#### 3. "Authentication fails"
- Ensure Auth Service is running on port 3001
- Check JWT_SECRET environment variable
- Clear browser localStorage and try again

#### 4. "Services show as offline"
- Check individual service logs
- Ensure MongoDB/Redis connections are working
- Verify service health endpoints respond

### Debug Steps

1. **Check service logs**:
   - Each service window will show logs
   - Look for startup errors or connection issues

2. **Verify network connectivity**:
   ```bash
   # Test individual services
   curl http://localhost:3000/health  # API Gateway
   curl http://localhost:3001/health  # Auth Service
   curl http://localhost:3002/health  # Laundry Service
   ```

3. **Check browser network tab**:
   - Open developer tools → Network
   - Look for failed requests
   - Check response headers and status codes

4. **Clear browser data**:
   - Clear localStorage/sessionStorage
   - Hard refresh (Ctrl+Shift+R)

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables**:
   ```env
   VITE_API_BASE_URL=https://api.your-domain.com/api/v1
   VITE_API_GATEWAY_URL=https://api.your-domain.com
   ```

2. **Build frontend**:
   ```bash
   npm run build
   ```

3. **Deploy built files**:
   - Upload `dist/` folder to your web server
   - Configure reverse proxy to API Gateway

4. **SSL/HTTPS**:
   - Ensure API Gateway has SSL certificate
   - Update WebSocket URL to use `wss://`

## 📚 API Documentation

For detailed API documentation, see:
- [Auth Service API](../backend/auth-service/README.md)
- [Laundry Service API](../backend/laundry-service/README.md)
- [Payment Service API](../backend/payment-service/README.md)
- [Lost & Found Service API](../backend/lostfound-service/README.md)
