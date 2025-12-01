/**
 * =============================================================================
 * AUTHENTICATION ROUTES
 * =============================================================================
 */

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../utils/validation';
import { asyncHandler } from '../utils/errors';
import { response } from '../utils/response';
import * as authService from '../services/authService';

const router = Router();

// Register
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    response.created(res, user, 'User registered successfully');
  })
);

// Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.loginUser(
      req.body.email,
      req.body.password,
      req.ip,
      req.get('user-agent')
    );
    response.success(res, result, 'Login successful');
  })
);

// Logout
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || '';
    await authService.logoutUser(token);
    response.success(res, null, 'Logout successful');
  })
);

// Refresh token
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    response.success(res, result, 'Token refreshed successfully');
  })
);

export default router;
