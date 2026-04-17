export type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function validateLoginForm(data: LoginFormData): { isValid: boolean; errors: Partial<Record<keyof LoginFormData, string>> } {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};

  if (!validateEmail(data.email)) {
    errors.email = "auth.errors.invalidEmail";
  }

  if (!validatePassword(data.password)) {
    errors.password = "auth.errors.passwordTooShort";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(data: RegisterFormData): { isValid: boolean; errors: Partial<Record<keyof RegisterFormData, string>> } {
  const errors: Partial<Record<keyof RegisterFormData, string>> = {};

  if (!data.name.trim()) {
    errors.name = "auth.errors.nameRequired";
  }

  if (!validateEmail(data.email)) {
    errors.email = "auth.errors.invalidEmail";
  }

  if (!validatePassword(data.password)) {
    errors.password = "auth.errors.passwordTooShort";
  }

  if (!validatePasswordMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = "auth.errors.passwordsDoNotMatch";
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = "auth.errors.termsRequired";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
