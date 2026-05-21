export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
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

export type AuthErrorCode =
  | "USERNAME_TAKEN"
  | "PASSWORD_INCORRECT"
  | "EMAIL_NOT_FOUND"
  | "AUTH_ERROR";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
