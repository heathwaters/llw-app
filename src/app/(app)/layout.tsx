import Link from 'next/link';
import { Home, BarChart3, Plus, Calendar, User, UtensilsCrossed } from 'lucide-react';
import { logOut } from '../(auth)/actions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24">
      <header className="max-w-2xl mx-auto px-5 pt-5 pb-3 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-lg">LLW</Link>
        <form action={logOut}>
          <button className="text-xs text-ink-soft hover:text-ink">Log out</button>
        </form>
      </header>

      <div className="max-w-2xl mx-auto px-5">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/[0.06] py-2 px-5">
        <div className="max-w-2xl mx-auto flex justify-around items-center">
          <NavLink href="/dashboard" icon={<Home className="w-5 h-5" />} label="Home" />
          <NavLink href="/sessions" icon={<Calendar className="w-5 h-5" />} label="Sessions" />
          <Link href="/log" className="bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center -mt-4 shadow-lg shadow-accent/40">
            <Plus className="w-6 h-6" />
          </Link>
          <NavLink href="/food" icon={<UtensilsCrossed className="w-5 h-5" />} label="Food" />
          <NavLink href="/stats" icon={<BarChart3 className="w-5 h-5" />} label="Stats" />
          <NavLink href="/profile" icon={<User className="w-5 h-5" />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink p-2">
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}
