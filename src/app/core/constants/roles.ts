import { UserRole } from '../models/user.model';

export const ROLES = {
  ADMIN: 'ADMIN',
  GENERAL: 'GENERAL',
} as const satisfies Record<string, UserRole>;