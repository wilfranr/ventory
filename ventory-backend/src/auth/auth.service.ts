import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import * as fs from "fs";
import * as path from "path";
import { User, Role, RoleName } from "@prisma/client";

type CompanyShort = {
  id: string;
  name: string;
};
type UserWithRoleAndCompany = User & {
  role: Role | null;
  company?: CompanyShort;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<
    (UserWithRoleAndCompany & { permissions: Array<{ name: string }> }) | null
  > {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException("Correo o contraseña incorrectos");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException("Correo o contraseña incorrectos");

    const permissions =
      user.role?.permissions?.map((perm) => ({ name: perm.name })) || [];

    return {
      ...user,
      permissions,
    };
  }

  login(user: UserWithRoleAndCompany) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
        company: {
          id: user.company?.id || null,
          name: user.company?.name || null,
        },
      },
    };
  }
  async register(
    data: CreateUserDto & { logo?: Express.Multer.File; token?: string },
  ) {
    if (data.token) {
      return this.registerWithToken(data as CreateUserDto & { token: string });
    } else {
      return this.registerWithCompany(data);
    }
  }

  private async registerWithToken(data: CreateUserDto & { token: string }) {
    // 1. busco el token
    const token = await this.prisma.registrationToken.findUnique({
      where: { token: data.token },
    });

    if (!token) {
      throw new BadRequestException("El token es inválido o ya fue usado.");
    }

    //Acá busco el rol por el nombre
    const role = await this.prisma.role.findUnique({
      where: { name: token.role as RoleName },
    });
    if (!role) {
      throw new BadRequestException("El rol no existe.");
    }

    // 2. Crear el usuario
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: role.id,
        companyId: token.companyId,
      },
    });

    // 3. Eliminar el token
    await this.prisma.registrationToken.delete({
      where: { token: data.token },
    });

    // 4. Respuesta
    return {
      message: "Usuario registrado exitosamente con token",
      userId: user.id,
      companyId: token.companyId,
    };
  }

  private async registerWithCompany(
    data: CreateUserDto & { logo?: Express.Multer.File },
  ) {
    // 📌 Verificar si el NIT ya está registrado
    const existingCompany = await this.prisma.company.findUnique({
      where: { nit: data.nit },
    });
    if (existingCompany) {
      throw new BadRequestException(
        "La empresa ya existe con ese número de NIT.",
      );
    }

    // 🖼️ Guardar logo si se envió
    let logoPath: string | undefined = undefined;
    if (data.logo) {
      const filename = `${Date.now()}_${data.logo.originalname}`;
      const dirPath = path.join(process.cwd(), "uploads", "logos");
      const filePath = path.join(dirPath, filename);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, data.logo.buffer);
      logoPath = `/uploads/logos/${filename}`;
    }

    // 🏢 Crear empresa
    const company = await this.prisma.company.create({
      data: {
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, "-"),
        nit: data.nit,
        address: data.address,
        phones: data.phones,
        email: data.companyEmail,
        website: data.website,
        logo: logoPath,
      },
    });

    // 🔐 Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 🔎 Buscar rol "admin"
    const role = await this.prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!role) {
      throw new Error(
        "❌ Rol 'admin' no encontrado. Asegúrate de ejecutar el seed.",
      );
    }

    // 👤 Crear usuario
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyId: company.id,
        roleId: role.id,
      },
    });

    return {
      message: "✅ Usuario y empresa registrados",
      companyId: company.id,
      userId: user.id,
    };
  }
}
