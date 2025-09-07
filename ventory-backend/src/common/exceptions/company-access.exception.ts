import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción lanzada cuando un usuario intenta acceder a datos de otra empresa.
 */
export class CompanyAccessException extends HttpException {
  constructor(message: string = 'No tienes acceso a los datos de esta empresa') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden - Company Access Denied',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Excepción lanzada cuando se intenta acceder a un recurso que no pertenece a la empresa.
 */
export class ResourceNotInCompanyException extends HttpException {
  constructor(resourceType: string, resourceId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resourceType} con ID ${resourceId} no encontrado o no pertenece a tu empresa`,
        error: 'Not Found - Resource Not In Company',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
