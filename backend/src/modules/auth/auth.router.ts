import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { login, logout, refreshTokens, getMe, authenticate, changePassword } from './auth.controller';
import { validateRequest } from '../../middleware/validate';
import { loginSchema, changePasswordSchema } from './auth.schema';

export const authRouter = Router();

authRouter.use(cookieParser());

// POST /api/v1/auth/login
authRouter.post('/login', validateRequest(loginSchema), login);

// POST /api/v1/auth/logout
authRouter.post('/logout', logout);

// POST /api/v1/auth/refresh
authRouter.post('/refresh', refreshTokens);

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, getMe);

// POST /api/v1/auth/change-password
authRouter.post('/change-password', authenticate, validateRequest(changePasswordSchema), changePassword);
