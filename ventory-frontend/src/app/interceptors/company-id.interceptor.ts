import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyContextService } from '../services/company-context.service';

export function companyIdInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const companyContextService = inject(CompanyContextService);
  const companyId = companyContextService.getActiveCompanyId();

  if (companyId) {
    req = req.clone({
      setHeaders: {
        'X-Company-ID': companyId
      }
    });
  }

  return next(req);
}