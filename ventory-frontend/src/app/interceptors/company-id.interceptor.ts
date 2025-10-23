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
  const userCompanyId = sessionService.companyId || localStorage.getItem('userCompanyId');
  const companyId = activeCompanyId || userCompanyId;

  console.log('[CompanyIdInterceptor] URL de la solicitud:', req.url);
  console.log('[CompanyIdInterceptor] activeCompanyId:', activeCompanyId);
  console.log('[CompanyIdInterceptor] sessionService.companyId:', sessionService.companyId);
  console.log('[CompanyIdInterceptor] userCompanyId del localStorage:', localStorage.getItem('userCompanyId'));
  console.log('[CompanyIdInterceptor] companyId que se enviará:', companyId);

  if (companyId) {
    console.log('[CompanyIdInterceptor] Añadiendo x-company-id a los headers:', companyId);
    req = req.clone({
      setHeaders: {
        'x-company-id': companyId
      }
    });
  } else {
    console.warn('[CompanyIdInterceptor] No se pudo determinar el companyId para la solicitud');
  }

  return next(req);
}