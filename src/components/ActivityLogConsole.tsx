import { ActivityLog } from '../store/slices/machineSlice';

type ActivityLogConsoleProps = {
  logs: ActivityLog[];
};

export function ActivityLogConsole({ logs }: ActivityLogConsoleProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-ink p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Realtime Console Log
          </span>
          <h3 className="mt-1 font-display text-lg font-bold">Activity Telemetry Stream</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="mt-4 max-h-56 overflow-y-auto space-y-2.5 font-mono text-xs pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="py-4 text-center text-white/40">Waiting for machine telemetry events...</div>
        ) : (
          logs.map((log) => {
            const badgeColor =
              log.type === 'success'
                ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                : log.type === 'error'
                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                  : log.type === 'warning'
                    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    : 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10';

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 transition-colors hover:bg-white/10"
              >
                <span className="shrink-0 text-white/40">{log.timestamp}</span>
                <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeColor}`}>
                  {log.type}
                </span>
                <span className="text-white/90 leading-relaxed">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
