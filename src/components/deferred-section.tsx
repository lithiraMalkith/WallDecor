"use client";
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function DeferredSection({ children, id, minHeight = 300 }: { children: ReactNode; id?: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '300px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div id={id} ref={ref} style={visible ? undefined : { minHeight }} className="scroll-mt-20">{visible ? children : null}</div>;
}
