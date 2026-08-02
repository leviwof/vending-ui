import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#dfe8f5_45%,_#c8d9ee)] text-ink">
      <Outlet />
    </div>
  );
}
