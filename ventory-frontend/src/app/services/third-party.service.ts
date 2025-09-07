import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ThirdParty, 
  Client, 
  Provider, 
  CreateClientDto, 
  CreateProviderDto, 
  UpdateThirdPartyDto 
} from '../models/third-party.model';

@Injectable({
  providedIn: 'root'
})
/**
 * Servicio responsable de realizar las peticiones HTTP
 * relacionadas con los terceros (clientes y proveedores).
 */
export class ThirdPartyService {
  private apiUrl = '/api/third-parties';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los terceros de la empresa actual.
   * El filtrado por empresa se maneja automáticamente por el interceptor.
   */
  getAll(): Observable<ThirdParty[]> {
    return this.http.get<ThirdParty[]>(this.apiUrl);
  }

  /**
   * Obtiene un tercero por su identificador.
   * El filtrado por empresa se maneja automáticamente por el interceptor.
   */
  getById(id: string): Observable<ThirdParty> {
    return this.http.get<ThirdParty>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene todos los clientes de la empresa actual.
   */
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  /**
   * Obtiene todos los proveedores de la empresa actual.
   */
  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.apiUrl}/providers`);
  }

  /**
   * Crea un nuevo cliente.
   */
  createClient(clientData: CreateClientDto): Observable<ThirdParty> {
    return this.http.post<ThirdParty>(`${this.apiUrl}/clients`, clientData);
  }

  /**
   * Crea un nuevo proveedor.
   */
  createProvider(providerData: CreateProviderDto): Observable<ThirdParty> {
    return this.http.post<ThirdParty>(`${this.apiUrl}/providers`, providerData);
  }

  /**
   * Actualiza un tercero existente.
   */
  update(id: string, thirdPartyData: UpdateThirdPartyDto): Observable<ThirdParty> {
    return this.http.patch<ThirdParty>(`${this.apiUrl}/${id}`, thirdPartyData);
  }

  /**
   * Elimina un tercero por su identificador.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
