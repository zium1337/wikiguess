export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export type AuthErrorCode = "USERNAME_TAKEN" | "AUTH_ERROR";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
