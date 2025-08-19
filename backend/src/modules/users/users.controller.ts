import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../../types/authenticated-request.interface";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  findAll(@Request() req: AuthenticatedRequest) {
    // console.log('Current User:', req.user);
    return this.usersService.findAllForUser(req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @Post()
  create(@Body() data: Partial<User>, @Request() req: AuthenticatedRequest) {
    return this.usersService.create(data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() data: Partial<User>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.usersService.remove(id);
  }
}
