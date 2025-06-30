/**
 * Decorador para definir los permisos requeridos en una ruta.
 */
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
