// Matches ApiResponse.java — every backend response is wrapped in this
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Matches PaginatedResponseDto.java — used by GET /products
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface DashboardSummary {
  totalProducts: number;
  totalUsers: number;
  totalStockAdds: number;
  totalStockReduces: number;
  lowStockProducts: number;
  totalInventoryValue: number;
}