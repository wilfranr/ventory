import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
// This decorator is used to set metadata for the permissions required for a route.
// It uses the SetMetadata function from NestJS to attach the permissions to the route handler.
// The permissions are passed as an array of strings.
// This allows for easy checking of permissions later in the application lifecycle.
// The permissions can be used to control access to certain routes or features in the application.
// By using this decorator, we can easily manage and check permissions in a consistent way throughout the application.
// This is particularly useful in applications with complex permission requirements or multiple user roles.
// The decorator can be applied to any route handler in a NestJS controller.