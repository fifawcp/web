import { useState } from "react";
import { useTranslations } from "next-intl";
import { RegisterFormData, AuthFormErrors } from "../types/auth.types";
import { validateRegisterForm } from "../schemas/auth.schema";

export function useRegister() {
  const t = useTranslations();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validation = validateRegisterForm(formData);

    if (!validation.isValid) {
      const translatedErrors: AuthFormErrors<RegisterFormData> = {};
      Object.entries(validation.errors).forEach(([key, value]) => {
        if (value) {
          translatedErrors[key as keyof RegisterFormData] = t(value);
        }
      });
      setErrors(translatedErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Register attempt:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Register error:", error);
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
