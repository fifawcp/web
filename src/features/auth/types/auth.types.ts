export type LoginFormData = {
  email: string;
  rememberMe?: boolean;
};

export type RegisterFormData = {
  name: string;
  email: string;
  acceptTerms: boolean;
};

export type AuthFormErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationResult<T> = {
  isValid: boolean;
  errors: AuthFormErrors<T>;
};
