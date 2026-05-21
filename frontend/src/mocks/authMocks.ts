import type { AuthResponse, LoginDto, RegisterDto } from "../models/AuthModels";
import { AuthError } from "../models/AuthModels";

export const mockAuthSuccess: AuthResponse = {
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

export const mockEmailNotFound = {
  code: "EMAIL_NOT_FOUND" as const,
  message: "No account associated with this email was found.",
};

export const mockPasswordIncorrect = {
  code: "PASSWORD_INCORRECT" as const,
  message: "The password you entered is wrong.",
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
        ...mockAuthSuccess,
        user: {
          ...mockAuthSuccess.user,
          username: dto.username,
          email: dto.email,
        },
      });
    }, 1000);
  });

export const mockLogin = (dto: LoginDto): Promise<AuthResponse> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (dto.email === "email@not.found") {
        reject(
          new AuthError(mockEmailNotFound.code, mockEmailNotFound.message),
        );
        return;
      }

      if (dto.password === "incorrect") {
        reject(
          new AuthError(
            mockPasswordIncorrect.code,
            mockPasswordIncorrect.message,
          ),
        );
        return;
      }
      resolve({
        ...mockAuthSuccess,
        user: {
          ...mockAuthSuccess.user,
          email: dto.email,
        },
      });
    }, 1000);
  });
