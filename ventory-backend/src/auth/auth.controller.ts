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
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("register")
  @UseInterceptors(FileInterceptor("logo"))
  register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.register({ ...createUserDto, logo: file });
  }

  @Public()
  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException();

    const access_token = await this.authService.login(user);
    return {
      access_token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        company: {
          id: user.company?.id || null,
          name: user.company?.name || null,
        },
      },
    };
  }
}
