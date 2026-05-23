// Matches TenantRequestDto.java — has tenantCode AND tenantName
export interface TenantRequest {
  tenantCode: string;
  tenantName: string;
}

// Matches TenantResponseDto.java
export interface TenantResponse {
  id: number;
  tenantCode: string;
  tenantName: string;
  active: boolean;
}