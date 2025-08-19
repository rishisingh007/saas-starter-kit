import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../../../src/modules/tenants/tenants.service';
import { Tenant } from '../../../src/modules/tenants/tenant.entity';

describe('TenantsService', () => {
  let service: TenantsService;
  let repo: jest.Mocked<Repository<Tenant>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repo = module.get<Repository<Tenant>>(getRepositoryToken(Tenant)) as jest.Mocked<Repository<Tenant>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleTenant: Tenant = { id: 1, name: 'Acme', users: [] } as Tenant;

  it('findAll should return all tenants', async () => {
    repo.find.mockResolvedValue([sampleTenant]);

    await expect(service.findAll()).resolves.toEqual([sampleTenant]);
    expect(repo.find).toHaveBeenCalledTimes(1);
  });

  it('findAllForUser should return all tenants for super_admin', async () => {
    repo.find.mockResolvedValue([sampleTenant]);

    await expect(service.findAllForUser({ role: 'super_admin' })).resolves.toEqual([sampleTenant]);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith();
  });

  it('findAllForUser should return only the admin\'s tenant for admin role', async () => {
    repo.find.mockResolvedValue([sampleTenant]);

    await expect(service.findAllForUser({ role: 'admin', tenantId: 1 })).resolves.toEqual([sampleTenant]);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findAllForUser should return empty array for regular users', () => {
    const result = service.findAllForUser({ role: 'user', tenantId: 2 });

    expect(result).toEqual([]);
    expect(repo.find).not.toHaveBeenCalled();
  });

  it('findOne should return a tenant by id', async () => {
    repo.findOneBy.mockResolvedValue(sampleTenant);

    await expect(service.findOne(1)).resolves.toEqual(sampleTenant);
    expect(repo.findOneBy).toHaveBeenCalledTimes(1);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('create should create and save a tenant', async () => {
    const dto: Partial<Tenant> = { name: 'New Tenant' };
    const created: Tenant = { id: 2, name: 'New Tenant', users: [] } as Tenant;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toEqual(created);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(created);
  });

  it('update should apply changes and return the updated tenant', async () => {
    const id = 1;
    const dto: Partial<Tenant> = { name: 'Updated Name' };
    const updated: Tenant = { id, name: 'Updated Name', users: [] } as Tenant;

    repo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as any);
    repo.findOne.mockResolvedValue(updated);

    await expect(service.update(id, dto)).resolves.toEqual(updated);
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(id, dto);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('remove should delete tenant and return deleted: true', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: [] } as any);

    await expect(service.remove(99)).resolves.toEqual({ deleted: true });
    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith(99);
  });
});
