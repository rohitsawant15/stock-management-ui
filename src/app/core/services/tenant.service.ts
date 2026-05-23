import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { TenantRequest, TenantResponse } from '../../shared/models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  // POST /api/v1/tenants — SUPER_ADMIN only
  createTenant(request: TenantRequest): Observable<ApiResponse<TenantResponse>> {
    return this.http.post<ApiResponse<TenantResponse>>(this.apiUrl, request);
  }

  // GET /api/v1/tenants — SUPER_ADMIN only
  getAllTenants(): Observable<ApiResponse<TenantResponse[]>> {
    return this.http.get<ApiResponse<TenantResponse[]>>(this.apiUrl);
  }

  // GET /api/v1/tenants/{id} — SUPER_ADMIN only
  getTenantById(id: number): Observable<ApiResponse<TenantResponse>> {
    return this.http.get<ApiResponse<TenantResponse>>(`${this.apiUrl}/${id}`);
  }
}