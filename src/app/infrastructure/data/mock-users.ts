import { User } from '../../core/models/user.model';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Administrador',
    email: 'admin@invernadero.com',
    password: '123456',
    role: 'ADMIN',
  },
  {
    id: 'user-002',
    name: 'Usuario General',
    email: 'general@invernadero.com',
    password: '123456',
    role: 'GENERAL',
  },
];