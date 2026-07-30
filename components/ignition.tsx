'use client';

import Link from 'next/link';
import { Power } from 'lucide-react';

// The start control.
//
// An arrow said "there is another page over there". This says "press me and
// something begins", which is what the moment actually is — she is standing in
// the gym doorway deciding to start.
//
// Two forms. With `href` it is a real link. Without one it renders a span, for
// use inside a card that is already a link: the whole card stays tappable, and
// nesting a link inside a link would be invalid and would confuse a screen
// reader into announcing two.

interface Props {
  href?: string;
  size?: 'lg' | 'sm';
  label?: string;
  ariaLabel?: string;
}

export default function Ignition({ href, size = 'lg', label = 'START', ariaLabel }: Props) {
  const className = `ignition ${size === 'sm' ? 'ignition-sm' : ''}`;
  const inner = (
    <>
      <Power size={size === 'sm' ? 16 : 20} strokeWidth={2.4} aria-hidden />
      <span className="ignition-label">{label}</span>
    </>
  );

  if (!href) {
    return <span className={className} aria-hidden>{inner}</span>;
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}
