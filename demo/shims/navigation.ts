// Stands in for `next/navigation` in the single-file build.
import { useEffect, useState } from 'react';

export function currentPath(): string {
  const h = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function usePathname(): string {
  const [path, setPath] = useState(currentPath());
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export function useRouter() {
  return {
    push(href: string) {
      window.location.hash = href;
    },
    replace(href: string) {
      window.location.replace(`#${href}`);
    },
    back() {
      window.history.back();
    },
    refresh() {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    },
  };
}

export function notFound(): never {
  throw new Error('NEXT_NOT_FOUND');
}
