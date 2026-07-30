'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Dumbbell, HeartPulse, TrendingUp } from 'lucide-react';

const items = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/plan', label: 'Plan', icon: CalendarDays },
  { href: '/library', label: 'Library', icon: Dumbbell },
  { href: '/cardio', label: 'Cardio', icon: HeartPulse },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t backdrop-blur"
      style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path?.startsWith(href) ?? false;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center py-2 min-h-[64px] text-[11px] font-medium"
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <Icon size={21} aria-hidden strokeWidth={active ? 2.4 : 1.9} />
                <span className="mt-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
