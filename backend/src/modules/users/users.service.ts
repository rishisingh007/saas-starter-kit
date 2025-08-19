import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find({ relations: ["tenant"] });
  }

  async findAllForUser(currentUser: any) {
    if (currentUser.role === "SUPER_ADMIN") {
      // console.log('Super SUPER_ADMIN accessing all users');
      // Super SUPER_ADMIN → see everything
      // let x = await this.userRepository.find({relations: ['tenant'] });
      let x = await this.userRepository.find({
        where: { role: UserRole.TENANT_ADMIN },
        relations: ["tenant"],
      });
      // console.log('Super SUPER_ADMIN accessing all users:', x);
      // Return the result
      return x;
    }
    if (currentUser.role === "TENANT_ADMIN") {
      // Admin → see only their tenant’s users
      // console.log('TENANT_ADMIN accessing users for tenant:', currentUser);
      return this.userRepository.find({
        where: { tenant: { id: currentUser.tenant.id } },
        relations: ["tenant"],
      });
    }
    // Regular user → only self
    return this.userRepository.find({
      where: { id: currentUser.id },
      relations: ["tenant"],
    });
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ["tenant"],
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ["tenant"],
    });
  }

  async create(data: Partial<User>, currentUser: any) {
    if (currentUser.role !== "SUPER_ADMIN") {
      // Only super admins can create super admins
      if (data.role === UserRole.SUPER_ADMIN) {
        throw new ForbiddenException(
          "Only super admins can create super admins",
        );
      }
      if (currentUser.role !== "TENANT_ADMIN") {
        throw new ForbiddenException(
          "Only super admins or tenant admins can create users",
        );
      }
      // force tenant assignment to current tenant
      data.tenant = { id: currentUser.tenant.id } as any;
    }
    // ✅ Set a default password for new users if not provided
    if (!data.passwordHash) {
      const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "password";
      const saltRounds = 10;
      data.passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
    }
    // console.log('Creating user with data:', data, currentUser);
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }
  async update(id: number, data: Partial<User>) {
    await this.userRepository.update(id, data);
    return this.userRepository.findOne({
      where: { id },
      relations: ["tenant"],
    });
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}
