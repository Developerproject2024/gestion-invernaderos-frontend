export type GreenhouseStatus = 'ACTIVE' | 'INACTIVE';

export interface Greenhouse {
  id: string;
  name: string;
  status: GreenhouseStatus;
  assignedUserIds: string[];
}