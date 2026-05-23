import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { StockRequest, StockHistoryResponse } from '../../shared/models/stock.model';
import { ProductResponse } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = `${environment.apiUrl}/stocks`;

  constructor(private http: HttpClient) {}

  // ── ADD STOCK ────────────────────────────────────────
  // POST /api/v1/stocks/add
  // Roles: ADMIN, INVENTORY_OPERATOR
  // Returns the updated ProductResponseDto (with new quantity)
  addStock(request: StockRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(
      `${this.apiUrl}/add`,
      request
    );
  }

  // ── REDUCE STOCK ─────────────────────────────────────
  // POST /api/v1/stocks/reduce
  // Roles: ADMIN, INVENTORY_OPERATOR
  // Backend throws exception if quantity would go below 0
  reduceStock(request: StockRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(
      `${this.apiUrl}/reduce`,
      request
    );
  }

  // ── STOCK HISTORY ────────────────────────────────────
  // GET /api/v1/stocks/history/{productId}
  // Roles: ADMIN, MANAGER
  // Returns List<StockHistoryResponseDto> — not paginated
  getStockHistory(productId: number): Observable<ApiResponse<StockHistoryResponse[]>> {
    return this.http.get<ApiResponse<StockHistoryResponse[]>>(
      `${this.apiUrl}/history/${productId}`
    );
  }
}