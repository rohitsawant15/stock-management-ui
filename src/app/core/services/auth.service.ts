import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../shared/models/auth.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'  // singleton — one instance for the whole app
})
export class AuthService {

  // Base API URL from environment.ts — '/api/v1' in dev
  private apiUrl = environment.apiUrl;

  // Key name used to store JWT in localStorage
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';

   // Emits true when user is logged in and token is ready
  // Components subscribe to this instead of making HTTP calls immediately
  private authReady$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // On app startup check if token already exists in localStorage
    // This handles page refresh — user is already logged in
    if (this.isLoggedIn()) {
      this.authReady$.next(true);
    }
  }
   // Expose as observable so components can wait for it
  get isAuthReady$() {
    return this.authReady$.asObservable();
  }

  // --------------------------------------------------
  // LOGIN — calls POST /api/v1/auth/login
  // --------------------------------------------------
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {

    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${this.apiUrl}/auth/login`,
        credentials
      )
      .pipe(
        // tap() lets us run a side effect without changing the stream value
        // Here we save the token as soon as the response arrives
        tap(response => {
          if (response.success && response.data?.token) {
            console.log('[AUTH] Login response received, saving token...');
            this.saveToken(response.data.token);
            console.log('[AUTH] Token saved to localStorage, verifying...', !!localStorage.getItem(this.TOKEN_KEY));
            // Signal that auth is ready AFTER token is saved
            this.authReady$.next(true);
            console.log('[AUTH] authReady$ emitted as true');
          }
        })
      );
  }

  // --------------------------------------------------
  // SAVE TOKEN to localStorage
  // --------------------------------------------------
  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);

    // Decode the JWT payload to extract user info (role, username)
    // JWT structure: header.payload.signature — all base64 encoded
    // We split by '.' and decode the middle part (index 1)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem(this.USER_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to decode JWT payload', e);
    }
  }

  // --------------------------------------------------
  // GET TOKEN — used by the interceptor to attach to requests
  // --------------------------------------------------
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      console.warn('[AUTH] getToken() called but no token found in localStorage');
    }
    return token;
  }

  // --------------------------------------------------
  // GET LOGGED IN USER — decoded JWT payload
  // --------------------------------------------------
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // --------------------------------------------------
  // GET USER ROLE — used by AuthGuard and role checks
  // --------------------------------------------------
 getUserRole(): string | null {
  const user = this.getUser();
  if (!user) return null;

  // Your JWT has 'role' field directly — e.g. "ADMIN"
  if (user.role) return user.role;

  // Fallback for Spring Security default format
  if (user.roles && user.roles.length > 0) {
    return user.roles[0].replace('ROLE_', '');
  }
  if (user.authorities && user.authorities.length > 0) {
    return user.authorities[0].authority?.replace('ROLE_', '')
      || user.authorities[0].replace('ROLE_', '');
  }
  return null;
}

  // --------------------------------------------------
  // IS LOGGED IN — checks if a token exists AND is not expired
  // --------------------------------------------------
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // JWT exp is in seconds, Date.now() is in milliseconds
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch (e) {
      return false;
    }
  }

  // --------------------------------------------------
  // LOGOUT — clear storage and go to login
  // --------------------------------------------------
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authReady$.next(false);
    this.router.navigate(['/auth/login']);
  }

  // --------------------------------------------------
  // ROLE CHECKS — convenience methods used in templates
  // --------------------------------------------------
  // Strict role check — exact match
hasRole(role: string): boolean {
  return this.getUserRole() === role;
}

// Check if user has any of the given roles
hasAnyRole(roles: string[]): boolean {
  const userRole = this.getUserRole();
  return userRole ? roles.includes(userRole) : false;
}

// Convenience methods — match exactly what backend @PreAuthorize uses
isSuperAdmin(): boolean {
  return this.hasRole('SUPER_ADMIN');
}

isAdmin(): boolean {
  // hasRole('ADMIN') in Spring = ADMIN or SUPER_ADMIN (due to role hierarchy)
  // We replicate that here
  return this.hasAnyRole(['ADMIN', 'SUPER_ADMIN']);
}

isManager(): boolean {
  return this.hasAnyRole(['MANAGER', 'ADMIN', 'SUPER_ADMIN']);
}

isInventoryOperator(): boolean {
  return this.hasAnyRole(['INVENTORY_OPERATOR', 'ADMIN', 'SUPER_ADMIN']);
}

canManageUsers(): boolean {
  return this.hasAnyRole(['ADMIN', 'SUPER_ADMIN']);
}

canManageProducts(): boolean {
  return this.hasAnyRole(['ADMIN', 'MANAGER', 'SUPER_ADMIN']);
}

canDoStockOperations(): boolean {
  return this.hasAnyRole(['ADMIN', 'INVENTORY_OPERATOR', 'SUPER_ADMIN']);
}

canDeleteProducts(): boolean {
  return this.hasAnyRole(['ADMIN', 'SUPER_ADMIN']);
}
}