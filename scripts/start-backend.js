import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const startMockServices = () => {
    // Payment Service Mock
    const paymentApp = express();
    paymentApp.use(helmet());
    paymentApp.use(cors());
    paymentApp.use(express.json());

    paymentApp.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'payment' });
    });

    paymentApp.get('/api/payments', (req, res) => {
        res.json({ payments: [], total: 0 });
    });

    paymentApp.listen(3003, () => {
        console.log('💳 Payment Service (Mock) running on port 3003');
    });

    // Notification Service Mock
    const notificationApp = express();
    notificationApp.use(helmet());
    notificationApp.use(cors());
    notificationApp.use(express.json());

    notificationApp.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'notification' });
    });

    notificationApp.get('/api/notifications', (req, res) => {
        res.json({ notifications: [], unread: 0 });
    });

    notificationApp.listen(3004, () => {
        console.log('🔔 Notification Service (Mock) running on port 3004');
    });

    // Lost & Found Service Mock
    const lostFoundApp = express();
    lostFoundApp.use(helmet());
    lostFoundApp.use(cors());
    lostFoundApp.use(express.json());

    lostFoundApp.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'lostfound' });
    });

    lostFoundApp.get('/api/lost-items', (req, res) => {
        res.json({ items: [] });
    });

    lostFoundApp.listen(3005, () => {
        console.log('🔍 Lost & Found Service (Mock) running on port 3005');
    });

    // Reporting Service Mock
    const reportingApp = express();
    reportingApp.use(helmet());
    reportingApp.use(cors());
    reportingApp.use(express.json());

    reportingApp.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'reporting' });
    });

    reportingApp.get('/api/reports', (req, res) => {
        res.json({ reports: [] });
    });

    reportingApp.listen(3006, () => {
        console.log('📊 Reporting Service (Mock) running on port 3006');
    });
};

startMockServices();
