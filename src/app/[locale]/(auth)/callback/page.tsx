"use client";

import { useEffect } from "react";
import { MoveLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import { getProfile, refreshToken } from "@/features/auth/api/client";
import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useApiError } from "@/shared/hooks/useApiError";

export default function CallbackPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "login";
  const apiError = useApiError();

  useEffect(() => {
    if (from !== "oauth") return;

    const bootstrap = async () => {
      try {
        const res = await refreshToken();
        if (!res.success) {
          apiError.set(res.error);
          return;
        }

        const { access_token, expires_at } = res.data!;

        const profileRes = await getProfile();
        if (!profileRes.success) {
          apiError.set(profileRes.error);
          return;
        }

        const user = profileRes.data!;

        await signIn("credentials", {
          access_token,
          expires_at,
          user: JSON.stringify(user),
          redirect: false,
        });

        router.refresh();
        router.replace("/");
      } catch {
        apiError.set({ code: "AUTHENTICATION_FAILED" });
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, router]);

  if (apiError.message) {
    return (
      <div className="mx-auto w-full max-w-md">
        <Card className="bg-card">
          <CardContent className="pt-6 text-center space-y-4">
            <ErrorAlert message={apiError.message} />
            <Button onClick={() => router.push("/login")} variant="link" className="w-full justify-center">
              <MoveLeft className="size-4 shrink-0" aria-hidden />
              {t("callback.backToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
