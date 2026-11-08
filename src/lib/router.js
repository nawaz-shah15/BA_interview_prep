import { useEffect, useState } from 'react';

function parse() {
  const h = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = h.split('?');
  return {
    path,
    params: new URLSearchParams(qs),
    segs: path.split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch { return s; } }),
  };
}

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path) => { window.location.hash = path; };
export const replace = (path) => window.location.replace(`#${path}`);
export const href = (path) => `#${path}`;
