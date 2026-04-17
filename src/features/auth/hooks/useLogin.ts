import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoginFormData, AuthFormErrors } from "../types/auth.types";
import { validateLoginForm } from "../schemas/auth.schema";

export function useLogin() {
  const t = useTranslations();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validation = validateLoginForm(formData);

    if (!validation.isValid) {
      const translatedErrors: AuthFormErrors<LoginFormData> = {};
      Object.entries(validation.errors).forEach(([key, value]) => {
        if (value) {
          translatedErrors[key as keyof LoginFormData] = t(value);
        }
      });
      setErrors(translatedErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login attempt:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
}
