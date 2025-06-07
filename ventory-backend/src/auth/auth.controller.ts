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

    const loginResponse = await this.authService.login(user);

    // Devuelve access_token, refresh_token y user (ya tienes el id garantizado)
    return {
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      user: loginResponse.user,
    };
  }

  @Post("refresh")
  async refreshTokens(@Body() data: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(
      Number(data.userId),
      data.refreshToken,
    );
  }

  @Post("logout")
  async logout(@Body() data: { userId: string }) {
    return this.authService.logout(Number(data.userId));
  }
}
