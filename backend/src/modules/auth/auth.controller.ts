import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    // console.log('Inside Auth Controller-User:', user);
    if (!user) return { error: "Invalid credentials" };
    return this.authService.login(user);
  }
}
