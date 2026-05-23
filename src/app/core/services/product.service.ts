import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../shared/models/api-response.model';
import { ProductRequest, ProductResponse } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;

  // Simple in-memory cache for dropdown usage
  // Cleared whenever a product is created, updated or deleted
  private allProductsCache: ProductResponse[] | null = null;

  constructor(private http: HttpClient) {}

  getAllProducts(page = 0, size = 5, sortBy = 'id', sortDirection = 'asc'): Observable<ApiResponse<PaginatedResponse<ProductResponse>>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', sortBy).set('sortDirection', sortDirection);
    return this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(this.apiUrl, { params });
  }

  searchProducts(keyword: string, page = 0, size = 5): Observable<ApiResponse<PaginatedResponse<ProductResponse>>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(`${this.apiUrl}/search`, { params });
  }

  filterProducts(filters: { productName?: string; productType?: string; minRate?: number; maxRate?: number }, page = 0, size = 5): Observable<ApiResponse<PaginatedResponse<ProductResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.productName) params = params.set('productName', filters.productName);
    if (filters.productType) params = params.set('productType', filters.productType);
    if (filters.minRate != null) params = params.set('minRate', filters.minRate);
    if (filters.maxRate != null) params = params.set('maxRate', filters.maxRate);
    return this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(`${this.apiUrl}/filter`, { params });
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`);
  }

  // Cached version — used by stock operation and history dropdowns
  // Returns cached list if available, otherwise fetches from backend
  getAllProductsForDropdown(): Observable<ProductResponse[]> {
    if (this.allProductsCache) {
      return of(this.allProductsCache);  // return cached immediately
    }
    const params = new HttpParams().set('page', 0).set('size', 1000).set('sortBy', 'productName').set('sortDirection', 'asc');
    return new Observable(observer => {
      this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(this.apiUrl, { params })
        .subscribe({
          next: (res) => {
            this.allProductsCache = res.data.content;
            observer.next(this.allProductsCache!);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
    });
  }

  createProduct(product: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    this.clearCache();
    return this.http.post<ApiResponse<ProductResponse>>(this.apiUrl, product);
  }

  updateProduct(id: number, product: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    this.clearCache();
    return this.http.put<ApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    this.clearCache();
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Call this after any stock operation so dropdown reflects new quantities
  clearCache(): void {
    this.allProductsCache = null;
  }
}