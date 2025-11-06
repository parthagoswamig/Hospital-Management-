import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
    tenantId: string;
    userId: string;
    email?: string;
    role?: string;
  };
}
