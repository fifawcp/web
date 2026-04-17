import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LoginFormData, validateLoginForm } from "@/lib/validations/auth";

export function useLogin() {
  const t = useTranslations();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateLoginForm(formData);

    if (!validation.isValid) {
      const translatedErrors: Partial<Record<keyof LoginFormData, string>> = {};
      Object.entries(validation.errors).forEach(([key, value]) => {
        if (value) {
          translatedErrors[key as keyof LoginFormData] = t(value);
        }
      });
      setErrors(translatedErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Login successful:", formData);
    } catch (error) {
      console.error("Login failed:", error);
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
