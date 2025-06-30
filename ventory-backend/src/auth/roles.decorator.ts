/**
 * Decorador para especificar roles permitidos en una ruta.
 */
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
