// Stands in for `next/link` when the app is bundled into a single hosted file.
// Routes become hash fragments so the whole thing runs from one HTML document.
import React from 'react';

interface Props extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children, ...rest }: Props) {
  return (
    <a href={`#${href}`} {...rest}>
      {children}
    </a>
  );
}
