import { serverApi } from "@/shared/lib/api/server";

export type Board = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default async function BoardsPage() {
  const res = await serverApi.get<Board[]>("/api/boards");

  if (!res.success) {
    return (
      <div className="min-h-[calc(100dvh-var(--header-height))] bg-linear-to-br from-wc-red/10 via-white to-wc-orange/10 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="container">
          <h1 className="text-2xl font-bold">Boards</h1>
          <p className="mt-4 text-destructive" role="alert">
            {res.error?.message ?? "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const boards = res.data ?? [];

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] bg-linear-to-br from-wc-red/10 via-white to-wc-orange/10 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Boards</h1>
        <ul className="mt-6 space-y-2">
          {boards.map((board) => (
            <li key={board.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="font-semibold text-zinc-900 dark:text-white">{board.name}</p>
              {board.description ? <p className="mt-1 text-sm text-muted-foreground">{board.description}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
