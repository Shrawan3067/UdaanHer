import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, Language } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  preferredLanguage?: 'EN' | 'HI';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        role: Role.DONOR,
        preferredLanguage: dto.preferredLanguage === 'EN' ? Language.EN : Language.HI,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return { user, token };
  }

  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };

    return { user: userProfile, token };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  private generateToken(userId: string, email: string, role: Role): string {
    return jwt.sign(
      { userId, email, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );
  }
}

export const authService = new AuthService();

