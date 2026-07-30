'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SessionPlayer from '@/components/session-player';
import { SESSIONS, weekForSessionCount } from '@/lib/train/programme';
import { load } from '@/lib/train/store';

export default function SessionPage({ params }: { params: { id: string } }) {
  const [week, setWeek] = useState<number | null>(null);

  useEffect(() => {
    setWeek(weekForSessionCount(load().logs.length));
  }, []);

  const session = SESSIONS.find((s) => s.id === params.id);

  if (!session) {
    return (
      <div className="py-8">
        <p className="muted">That session does not exist.</p>
        <Link href="/" className="btn btn-ghost mt-3">Back to today</Link>
      </div>
    );
  }

  if (week === null) return <p className="muted py-8">Loading…</p>;

  return <SessionPlayer session={session} week={week} />;
}
