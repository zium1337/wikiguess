import axios from "axios";
import {
  AuthError,
  type AuthResponse,
  type LoginDto,
  type PasswordChangeDto,
  type RegisterDto,
} from "../models/AuthModels";
import { api } from "./AppService";

const REGISTER_URL = "/auth/register";
const LOGIN_URL = "/auth/login";

export const register = async (dto: RegisterDto): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(REGISTER_URL, dto);
    return response.data;
  } catch (err) {
    throw mapToAuthError(err);
  }
};

export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(LOGIN_URL, dto);
    return response.data;
  } catch (err) {
    throw mapToAuthError(err);
  }
};

export const changePassword = async (
  dto: PasswordChangeDto,
  userId: string,
): Promise<void> => {
  try {
    await api.patch(`/user/change-password/${userId}`, dto);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new AuthError("PASSWORD_INCORRECT", "Current password is incorrect.");
    }
    throw mapToAuthError(err);
  }
};

const mapToAuthError = (err: unknown): AuthError => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const raw = err.response?.data;
    const message =
      typeof raw === "string" && raw.length > 0 ? raw : err.message;

    if (status === 401) {
      return new AuthError("AUTH_ERROR", "Invalid email or password.");
    }

    if (status === 400 || status === 409) {
      const lower = message.toLowerCase();
      if (lower.includes("username")) {
        return new AuthError(
          "USERNAME_TAKEN",
          "This username is already taken.",
        );
      }
      if (lower.includes("email")) {
        return new AuthError("AUTH_ERROR", "This email is already registered.");
      }
      return new AuthError("AUTH_ERROR", message);
    }
  }
  return new AuthError("AUTH_ERROR", "Something went wrong. Please try again.");
};
