/**
 * Decorador personalizado para obtener el usuario actual de la petición.
 */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
