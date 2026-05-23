// Matches StockRequestDto.java
export interface StockRequest {
  productId: number;
  quantity: number;
}

// Matches StockOperationType enum in Java
export type StockOperationType = 'ADD' | 'REDUCE';

// Matches StockHistoryResponseDto.java
export interface StockHistoryResponse {
  id: number;
  operationType: StockOperationType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  operationTime: string;   // ISO date string from backend LocalDateTime
  productId: number;
  productName: string;
  productCode: string;
}