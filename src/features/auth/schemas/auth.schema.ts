import { LoginFormData, RegisterFormData, ValidationResult } from "../types/auth.types";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validateLoginForm = (data: LoginFormData): ValidationResult<LoginFormData> => {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};

  if (!data.email) {
    errors.email = "auth.errors.emailRequired";
  } else if (!validateEmail(data.email)) {
    errors.email = "auth.errors.invalidEmail";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: RegisterFormData): ValidationResult<RegisterFormData> => {
  const errors: Partial<Record<keyof RegisterFormData, string>> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "auth.errors.nameRequired";
  }

  if (!data.email) {
    errors.email = "auth.errors.emailRequired";
  } else if (!validateEmail(data.email)) {
    errors.email = "auth.errors.invalidEmail";
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = "auth.errors.termsRequired";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
