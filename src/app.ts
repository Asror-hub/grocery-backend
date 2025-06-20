import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import orderRoutes from './routes/orderRoutes';
import customerAuthRoutes from './routes/customerAuthRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/category';
import productRoutes from './routes/product';
import profileRoutes from './routes/profile';
import settingsRoutes from './routes/settings';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount routes
app.use('/api/orders', orderRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api', profileRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

export default app; 