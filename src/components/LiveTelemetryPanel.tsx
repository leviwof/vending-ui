import { TelemetryData } from '../store/slices/machineSlice';

type LiveTelemetryPanelProps = {
  telemetry: TelemetryData;
  machineState: string;
};

export function LiveTelemetryPanel({ telemetry, machineState }: LiveTelemetryPanelProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">
            IoT Telemetry Stream
          </span>
          <h3 className="mt-1 font-display text-xl font-bold text-ink">Machine Diagnostics</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
          <span>{machineState}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Machine Status */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">Status</div>
          <div className="mt-1 flex items-center gap-1.5 font-display text-sm font-bold text-emerald-600">
            <span>🟢</span> Online
          </div>
        </div>

        {/* Temperature */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">Temperature</div>
          <div className="mt-1 font-display text-sm font-bold text-ink">
            ❄️ {telemetry.temperature.toFixed(1)}°C
          </div>
        </div>

        {/* Vend Motor */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">Vend Motor</div>
          <div className="mt-1 font-display text-sm font-bold text-emerald-600">
            ⚙️ Healthy
          </div>
        </div>

        {/* Door Sensor */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">Door Position</div>
          <div className="mt-1 font-display text-sm font-bold text-ink">
            🚪 Closed
          </div>
        </div>

        {/* Coin Acceptor */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">Coin Acceptor</div>
          <div className="mt-1 font-display text-sm font-bold text-amber-600">
            🪙 Ready
          </div>
        </div>

        {/* QR Scanner */}
        <div className="rounded-2xl bg-mist/60 p-3.5">
          <div className="text-[10px] font-semibold text-ink/50">QR Scanner</div>
          <div className="mt-1 font-display text-sm font-bold text-indigo-600">
            📱 Ready
          </div>
        </div>
      </div>
    </section>
  );
}
