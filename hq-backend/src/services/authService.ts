/**
 * =============================================================================
 * AUTHENTICATION SERVICE
 * =============================================================================
 * Handles user authentication, registration, and token management
 * =============================================================================
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db';
import { UnauthorizedError, ConflictError, BadRequestError } from '../utils/errors';
import { UserRole } from '@prisma/client';
import { log } from '../utils/logger';

/**
 * Register a new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, config.security.bcryptRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'ANALYST',
      phone: data.phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  });

  log.info(`New user registered: ${user.email}`, { userId: user.id });

  return user;
}

/**
 * Login user and generate tokens
 */
export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate tokens
  const token = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Save session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  log.info(`User logged in: ${user.email}`, { userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    token,
    refreshToken,
  };
}

/**
 * Logout user (invalidate session)
 */
export async function logoutUser(token: string) {
  await prisma.session.deleteMany({
    where: { token },
  });

  log.info('User logged out');
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };

  // Find session
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if session expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new UnauthorizedError('Session expired');
  }

  // Check if user is active
  if (!session.user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  // Generate new access token
  const token = generateAccessToken(session.user.id, session.user.email, session.user.role);

  // Update session with new token
  await prisma.session.update({
    where: { id: session.id },
    data: { token },
  });

  return {
    token,
    refreshToken,
  };
}

/**
 * Change user password
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId },
  });

  log.info(`Password changed for user: ${user.email}`, { userId });
}

/**
 * Generate JWT access token
 */
function generateAccessToken(userId: string, email: string, role: UserRole): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );
}

/**
 * Verify token
 */
export function verifyToken(token: string): { userId: string; email: string; role: UserRole } {
  try {
    return jwt.verify(token, config.jwt.secret) as { userId: string; email: string; role: UserRole };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
