import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { UserRegistrationRequest, UserResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // POST /api/v1/users/register — no auth required
  registerUser(request: UserRegistrationRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.apiUrl}/register`, request
    );
  }

  // GET /api/v1/users — ADMIN only
  // Returns List<UserResponseDto> not paginated
  getAllUsers(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.apiUrl);
  }

  // GET /api/v1/users/{id} — ADMIN only
  getUserById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`);
  }
}