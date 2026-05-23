// Matches ProductRequestDto.java
export interface ProductRequest {
  productCode: string;
  productName: string;
  productType?: string;   // optional — no @NotNull in backend
  rate: number;
  volume?: number;        // optional
  quantity: number;
}

// Matches ProductResponseDto.java
export interface ProductResponse {
  id: number;
  productCode: string;
  productName: string;
  productType: string;
  rate: number;
  volume: number;
  quantity: number;
}