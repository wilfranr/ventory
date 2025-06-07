import { User, Role, Company } from '@prisma/client';

export interface AuthUser extends User {
  role?: Role | null;
  company?: Pick<Company, 'id' | 'name'>;
  permissions?: Array<{ name: string }>;
}
