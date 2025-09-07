import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CompanyAccessException } from '../exceptions/company-access.exception';

// Interfaz para el usuario del request
interface RequestUser {
  id: string;
  companyId: string;
  [key: string]: any;
}

// Extender la interfaz Request para incluir el usuario tipado
interface RequestWithUser extends Request {
  user?: RequestUser;
}

/**
 * Filtro global para manejar excepciones relacionadas con acceso a empresas.
 * Proporciona logging detallado y respuestas consistentes.
 */
@Catch(CompanyAccessException, HttpException)
export class CompanyAccessFilter implements ExceptionFilter {
  private readonly logger = new Logger(CompanyAccessFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();
    const status = exception.getStatus();

    // Log detallado para auditoría
    this.logger.warn(
      `Company Access Violation: ${request.method} ${request.url} - ` +
      `User: ${request.user?.id || 'anonymous'} - ` +
      `Company: ${request.user?.companyId || 'none'} - ` +
      `Message: ${exception.message}`,
    );

    // Respuesta estructurada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message,
      ...(status === HttpStatus.FORBIDDEN && {
        error: 'Forbidden - Company Access Denied',
        details: 'No tienes permisos para acceder a los datos de esta empresa',
      }),
    };

    response.status(status).json(errorResponse);
  }
}
