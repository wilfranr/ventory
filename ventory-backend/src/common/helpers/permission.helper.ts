import { User, Permission } from "@prisma/client";

/**
 * Verifico si el usuario tiene un permiso específico.
 * @param user - Usuario autenticado
 * @param permission - Permiso requerido
 * @returns boolean - Retorna true si el usuario tiene el permiso, false en caso contrario.
 */

export function hasPermission(
  user: { permissions?: Array<{ name: string }> },
  permissionName: string,
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.some((perm) => perm.name === permissionName);
}

/**
 * Verifico si el usuario tiene alguno de los permisos indicados.
 * @param use Objeto usuario con la propiedad permissions
 * @param permissionNames Array de permisos a verificar
 * @returns true si tiene al menos uno, false si no tiene ninguno.
 */

export function hasAnyPermission(
  user: { permissions?: Array<{ name: string }> },
  permissionNames: string[],
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.some((perm) => permissionNames.includes(perm.name));
}
