import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../src/modules/users/users.service';
import { User, UserRole } from '../../../src/modules/users/user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const tenant = { id: 1, name: 'Acme' } as any;
  const sampleUser: User = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    passwordHash: 'hash',
    role: UserRole.USER,
    tenant,
  } as User;

  it('findAll should return all users with tenant relation', async () => {
    repo.find.mockResolvedValue([sampleUser]);

    await expect(service.findAll()).resolves.toEqual([sampleUser]);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith({ relations: ['tenant'] });
  });

  it('findAllForUser should return TENANT_ADMIN users for SUPER_ADMIN', async () => {
    const adminUsers = [{ ...sampleUser, role: UserRole.TENANT_ADMIN } as User];
    repo.find.mockResolvedValue(adminUsers);

    await expect(service.findAllForUser({ role: 'SUPER_ADMIN' })).resolves.toEqual(adminUsers);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith({ where: { role: UserRole.TENANT_ADMIN }, relations: ['tenant'] });
  });

  it('findAllForUser should return only users from the tenant for TENANT_ADMIN', async () => {
    const currentUser = { role: 'TENANT_ADMIN', tenant: { id: 42 } };
    repo.find.mockResolvedValue([sampleUser]);

    await expect(service.findAllForUser(currentUser)).resolves.toEqual([sampleUser]);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith({ where: { tenant: { id: 42 } }, relations: ['tenant'] });
  });

  it('findAllForUser should return only self for regular user', async () => {
    const currentUser = { role: 'USER', id: 5 };
    repo.find.mockResolvedValue([sampleUser]);

    await expect(service.findAllForUser(currentUser)).resolves.toEqual([sampleUser]);
    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(repo.find).toHaveBeenCalledWith({ where: { id: 5 }, relations: ['tenant'] });
  });

  it('findOne should return a user by id with tenant relation', async () => {
    repo.findOne.mockResolvedValue(sampleUser);

    await expect(service.findOne(1)).resolves.toEqual(sampleUser);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['tenant'] });
  });

  it('findByEmail should return a user by email with tenant relation', async () => {
    repo.findOne.mockResolvedValue(sampleUser);

    await expect(service.findByEmail('alice@example.com')).resolves.toEqual(sampleUser);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'alice@example.com' }, relations: ['tenant'] });
  });

  it('create should allow SUPER_ADMIN to create and set default password if missing', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-default');
    const dto: Partial<User> = { name: 'Bob', email: 'bob@example.com', role: UserRole.USER };
    const created: User = { id: 2, ...dto, passwordHash: 'hashed-default', tenant } as User;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    await expect(service.create(dto, { role: 'SUPER_ADMIN' })).resolves.toEqual(created);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bob', email: 'bob@example.com', passwordHash: 'hashed-default' }));
    expect(repo.save).toHaveBeenCalledWith(created);
  });

  it('create should set tenant and default password for TENANT_ADMIN creating a user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-default');
    const dto: Partial<User> = { name: 'Carl', email: 'carl@example.com', role: UserRole.USER };
    const currentUser = { role: 'TENANT_ADMIN', tenant: { id: 99 } };
    const created: User = { id: 3, ...dto, passwordHash: 'hashed-default', tenant: { id: 99 } as any } as User;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    await expect(service.create(dto, currentUser)).resolves.toEqual(created);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ tenant: { id: 99 }, passwordHash: 'hashed-default' }));
    expect(repo.save).toHaveBeenCalledWith(created);
  });

  it('create should reject when non-super tries to create SUPER_ADMIN', async () => {
    const dto: Partial<User> = { name: 'Eve', email: 'eve@example.com', role: UserRole.SUPER_ADMIN };

    await expect(service.create(dto, { role: 'TENANT_ADMIN', tenant: { id: 1 } })).rejects.toThrow('Only super admins can create super admins');
    expect(repo.create).not.toHaveBeenCalled();
    expect((bcrypt.hash as jest.Mock)).not.toHaveBeenCalled();
  });

  it('create should reject when non-admin user tries to create user', async () => {
    const dto: Partial<User> = { name: 'Eve', email: 'eve@example.com', role: UserRole.USER };

    await expect(service.create(dto, { role: 'USER', id: 10 })).rejects.toThrow('Only super admins or tenant admins can create users');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('create should not hash password if passwordHash is already provided', async () => {
    const dto: Partial<User> = { name: 'Dan', email: 'dan@example.com', role: UserRole.USER, passwordHash: 'prehash' };
    const currentUser = { role: 'SUPER_ADMIN' };
    const created: User = { id: 4, ...dto, tenant } as User;

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    await expect(service.create(dto, currentUser)).resolves.toEqual(created);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: 'prehash' }));
    expect(repo.save).toHaveBeenCalledWith(created);
  });

  it('update should apply changes and return the updated user', async () => {
    const id = 1;
    const dto: Partial<User> = { name: 'Updated Alice' };
    const updated: User = { ...sampleUser, name: 'Updated Alice' } as User;

    repo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as any);
    repo.findOne.mockResolvedValue(updated);

    await expect(service.update(id, dto)).resolves.toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(id, dto);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['tenant'] });
  });

  it('remove should delete user and return deleted: true', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: [] } as any);

    await expect(service.remove(7)).resolves.toEqual({ deleted: true });
    expect(repo.delete).toHaveBeenCalledWith(7);
  });
});
