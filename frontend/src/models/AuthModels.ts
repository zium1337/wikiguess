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
<<<<<<< HEAD
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface PasswordChangeDto {
  new_password: string;
  old_password: string;
=======
  id: string;
  username: string;
  email: string;
>>>>>>> main
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
