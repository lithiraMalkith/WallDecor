"use client";
import { useEffect, useRef, type ReactNode } from 'react';

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches || element.getBoundingClientRect().top < innerHeight) return;
    element.dataset.revealPending = 'true';
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { delete element.dataset.revealPending; observer.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    observer.observe(element);
    return () => { observer.disconnect(); delete element.dataset.revealPending; };
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
