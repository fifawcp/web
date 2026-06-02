import { JoinInviteCard } from "@/features/boards/components/JoinInviteCard";
import type { BoardPreview } from "@/features/boards/types/boards.types";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function JoinBoardPage({ params }: Props) {
  const [{ code }, user] = await Promise.all([params, getCurrentUser()]);

  const res = await serverApi.get<BoardPreview>(`/api/boards/preview?code=${encodeURIComponent(code)}`, {
    authenticated: false,
    next: { revalidate: 30 },
  });

  const preview = res.success ? (res.data ?? null) : null;

  return <JoinInviteCard preview={preview} code={code} isAuthenticated={!!user} />;
}
