export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'INVENTORY_OPERATOR' | 'VIEWER';

// Matches UserRegistrationRequestDto.java exactly
export interface UserRegistrationRequest {
  fullName: string;       // backend has fullName not username as display
  email: string;
  username: string;
  password: string;
  role: RoleType;
  tenantId: number;
}

// Matches UserResponseDto.java exactly
export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  username: string;
  role: RoleType;
  active: boolean;
}