import { Role } from './models.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
