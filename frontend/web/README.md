# Smart Laundry System - Frontend

A comprehensive IoT-enabled smart laundry management system for residential complexes, hotels, and laundromats.

## Key Features

- 📱 Mobile and web applications for users
- 🏠 Real-time machine availability tracking
- 📊 Smart demand forecasting using AI/ML
- 💰 Cryptocurrency payment integration
- 🔍 Lost & found item matching with computer vision
- 🌐 Digital twin simulation for optimization
- 📲 Real-time notifications and alerts
- 🎨 Modern UI with shadcn/ui components

## Architecture

- **Frontend**: React with TypeScript, modern component library
- **Backend**: Node.js microservices architecture
- **IoT**: MQTT-based device communication
- **AI/ML**: Python-based machine learning models
- **Database**: MongoDB for data storage
- **Payments**: Blockchain integration for crypto payments

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for components
- React Query for state management

### Backend Services
- **Auth Service**: User authentication and authorization
- **Laundry Service**: Machine management and booking
- **Payment Service**: Crypto and traditional payments
- **Notification Service**: Real-time alerts and notifications
- **Lost & Found Service**: Computer vision-based item matching
- **Reporting Service**: Analytics and insights

### Infrastructure
- Docker containerization
- Kubernetes orchestration
- Azure Digital Twins for simulation

## Development

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Instructions

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd smart-laundry-system

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Deployment

The application can be deployed to various platforms:

### Vercel/Netlify
Simply connect your repository and deploy with zero configuration.

### Docker
```bash
docker build -t smart-laundry-frontend .
docker run -p 8080:8080 smart-laundry-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
