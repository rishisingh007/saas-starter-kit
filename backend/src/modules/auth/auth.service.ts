import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "../users/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ["tenant"],
    });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException();
    const payload = {
      name: user.name,
      username: user.email,
      sub: user.id,
      tenant: user.tenant,
      role: user.role,
    };
    console.log("Login payload:", payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
