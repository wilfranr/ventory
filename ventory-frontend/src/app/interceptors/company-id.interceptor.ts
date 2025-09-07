import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyContextService } from '../services/company-context.service';
import { SessionService } from '../services/session.service';

/**
 * Interceptor que añade automáticamente el ID de empresa a todas las peticiones HTTP.
 * Prioriza el contexto de empresa activa para superadmin, o usa la empresa del usuario.
 */
export function companyIdInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const companyContextService = inject(CompanyContextService);
  const sessionService = inject(SessionService);
  
  // Obtener companyId del contexto activo o de la sesión del usuario
  const activeCompanyId = companyContextService.getActiveCompanyId();
  const userCompanyId = sessionService.companyId;
  const companyId = activeCompanyId || userCompanyId;

  if (companyId) {
    req = req.clone({
      setHeaders: {
        'X-Company-ID': companyId
      }
    });
  }

  return next(req);
}