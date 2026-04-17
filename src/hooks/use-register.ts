import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { RegisterFormData, validateRegisterForm } from "@/lib/validations/auth";

export function useRegister() {
  const t = useTranslations();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateRegisterForm(formData);

    if (!validation.isValid) {
      const translatedErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      Object.entries(validation.errors).forEach(([key, value]) => {
        if (value) {
          translatedErrors[key as keyof RegisterFormData] = t(value);
        }
      });
      setErrors(translatedErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Registration successful:", formData);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
