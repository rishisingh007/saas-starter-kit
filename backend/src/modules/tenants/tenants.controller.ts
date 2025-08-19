import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Tenant } from "./tenant.entity";
import { AuthenticatedRequest } from "../../types/authenticated-request.interface";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  // Only super_admin can list tenants
  @Get()
  @Roles("SUPER_ADMIN")
  async getAll(@Request() req: AuthenticatedRequest) {
    return this.tenantsService.findAll();
  }

  // Get a tenant by id (super_admin only)
  @Get(":id")
  @Roles("SUPER_ADMIN")
  async getOne(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.tenantsService.findOne(+id);
  }

  // Create a new tenant (super_admin only)
  @Post()
  @Roles("SUPER_ADMIN")
  async create(
    @Body() data: Partial<Tenant>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tenantsService.create(data);
  }

  // Update tenant (super_admin only)
  @Put(":id")
  @Roles("SUPER_ADMIN")
  async update(
    @Param("id") id: string,
    @Body() data: Partial<Tenant>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tenantsService.update(+id, data);
  }

  // Delete tenant (super_admin only)
  @Delete(":id")
  @Roles("SUPER_ADMIN")
  async remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.tenantsService.remove(+id);
  }
}
