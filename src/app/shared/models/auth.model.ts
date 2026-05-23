// Matches LoginRequestDto.java
export interface LoginRequest {
  username: string;
  password: string;
}

// Matches LoginResponseDto.java
export interface LoginResponse {
  token: string;
  type: string;
}