export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <img src="/vercel.svg" alt="Vercel logo" />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">{`FIFA World Cup Pick'em`}</h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {`Welcome to the FIFA World Cup Pick'em game. Pick the winners of each match and see how you rank against other players.`}
          </p>
        </div>
      </main>
    </div>
  );
}
