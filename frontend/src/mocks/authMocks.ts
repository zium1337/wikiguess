import type { AuthResponse, RegisterDto } from "../models/AuthModels";
import { AuthError } from "../models/AuthModels";

export const mockRegisterSuccess: AuthResponse = {
  token: "mock.jwt.token.value",
  user: {
    id: "user-mock-1",
    username: "Mock_User",
    email: "mock.user@example.com",
  },
};

export const mockRegisterUsernameTaken = {
  code: "USERNAME_TAKEN" as const,
  message: "Username is already taken.",
};

export const mockRegister = (dto: RegisterDto): Promise<AuthResponse> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (dto.username === "taken") {
        reject(
          new AuthError(
            mockRegisterUsernameTaken.code,
            mockRegisterUsernameTaken.message,
          ),
        );
        return;
      }
      resolve({
        ...mockRegisterSuccess,
        user: {
          ...mockRegisterSuccess.user,
          username: dto.username,
          email: dto.email,
        },
      });
    }, 1000);
  });
