import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// HttpInterceptorFn is a plain function — no class, no @Injectable
// Angular calls this function for EVERY outgoing HTTP request
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {

  // inject() works inside interceptor functions in Angular 17+
  const authService = inject(AuthService);
  const token = authService.getToken();

  // If no token exists (user not logged in), pass the request through unchanged
  if (!token) {
    console.warn(`[JWT-INTERCEPTOR] No token available for request: ${req.url}`);
    return next(req);
  }

  console.log(`[JWT-INTERCEPTOR] Attaching token to request: ${req.url}`);

  // Clone the request and add the Authorization header
  // We MUST clone — HttpRequest objects are immutable
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
      // This matches what your JwtAuthenticationFilter.java expects:
      // it reads the "Authorization" header and strips "Bearer "
    }
  });

  // Pass the cloned request with the token to the next handler
  return next(authReq);
};