/**
 * Decorador para asignar permisos requeridos a una ruta.
 */
import { SetMetadata } from "@nestjs/common";

export const Permissions = (...permissions: string[]) =>
  SetMetadata("permissions", permissions);
