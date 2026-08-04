'use client';

import Link from 'next/link';
import SessionPlayer from '@/components/session-player';
import { SESSIONS, weekForSessionCount } from '@/lib/train/programme';
import { useTrainState } from '@/lib/train/use-store';

export default function SessionPage({ params }: { params: { id: string } }) {
  const state = useTrainState();
  const week = state ? weekForSessionCount(state.logs.length) : null;

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
