import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "./tenant.entity";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  findAll() {
    return this.tenantRepository.find();
  }

  findAllForUser(currentUser: any) {
    if (currentUser.role === "super_admin") {
      return this.tenantRepository.find();
    }
    if (currentUser.role === "admin") {
      return this.tenantRepository.find({
        where: { id: currentUser.tenantId },
      });
    }
    // Regular users should not fetch tenants
    return [];
  }

  findOne(id: number) {
    return this.tenantRepository.findOneBy({ id });
  }

  create(data: Partial<Tenant>) {
    const tenant = this.tenantRepository.create(data);
    return this.tenantRepository.save(tenant);
  }

  async update(id: number, data: Partial<Tenant>) {
    await this.tenantRepository.update(id, data);
    return this.tenantRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.tenantRepository.delete(id);
    return { deleted: true };
  }
}
