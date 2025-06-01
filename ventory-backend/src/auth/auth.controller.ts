import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UseInterceptors(FileInterceptor("logo"))
  register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.authService.register({ ...createUserDto, logo: file });
  }

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException();

    const access_token = await this.authService.login(user);
    console.log("Login successful for user:", user.email, user.role);
    return {
      access_token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
