import { Request } from "express";
import { Tenant } from "../modules/tenants/tenant.entity";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    tenant: Tenant;
    role: string; // 'superadmin' | 'admin' | 'user'
  };
}
