export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl">
        <div className="text-sm uppercase tracking-[0.35em] text-ink/50">Admin access</div>
        <h1 className="mt-3 font-display text-3xl">Sign in to manage the fleet</h1>
        <form className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-mist bg-white px-4 py-3" placeholder="Email" />
          <input className="w-full rounded-2xl border border-mist bg-white px-4 py-3" type="password" placeholder="Password" />
          <button className="w-full rounded-2xl bg-ink px-4 py-3 font-medium text-white" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
