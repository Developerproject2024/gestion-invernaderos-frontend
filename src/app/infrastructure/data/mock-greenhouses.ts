import { Greenhouse } from '../../core/models/greenhouse.model';

export const MOCK_GREENHOUSES: Greenhouse[] = [
  {
    id: 'greenhouse-001',
    name: 'Invernadero Norte',
    status: 'ACTIVE',
    assignedUserIds: ['user-002'],
  },
  {
    id: 'greenhouse-002',
    name: 'Invernadero Central',
    status: 'ACTIVE',
    assignedUserIds: ['user-002'],
  },
  {
    id: 'greenhouse-003',
    name: 'Invernadero Sur',
    status: 'ACTIVE',
    assignedUserIds: [],
  },
  {
    id: 'greenhouse-004',
    name: 'Invernadero Experimental',
    status: 'INACTIVE',
    assignedUserIds: [],
  },
];