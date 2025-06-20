import express, { Router, RequestHandler } from 'express';
import { register, login, logout } from '../controllers/authController';
import { auth } from '../middlewares/auth';

const router: Router = express.Router();

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/logout', auth, logout as RequestHandler);

export default router; 