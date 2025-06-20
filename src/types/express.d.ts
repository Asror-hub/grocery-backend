import { Model } from 'sequelize';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface UserInstance extends Model<UserAttributes>, UserAttributes {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserInstance;
    }
  }
} 