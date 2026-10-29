"use client";
import type { StorefrontMedia } from "@/lib/storefront-media";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

export function ArtworkCarousel({ scenes }: { scenes: StorefrontMedia[] }) {
  const cards = useMemo(() => [...scenes, ...scenes, ...scenes], [scenes]);
  const viewport = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const motion = useRef({ offset: 0, target: 0, hover: false, focus: false, drag: false, lastX: 0, distance: 0, reduced: false, paused: false, stride: 178 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!cards.length) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      motion.current.reduced = media.matches;
      motion.current.paused = media.matches;
      setPaused(media.matches);
    };
    preference();
    media.addEventListener("change", preference);
    let frame = 0;
    let previous = 0;
    let renderedOffset = NaN;
    let renderedWidth = NaN;
    let idle: number | undefined;
    let width = viewport.current?.clientWidth ?? 1280;
    const observer = new ResizeObserver(([entry]) => { width = entry.contentRect.width; });
    if (viewport.current) observer.observe(viewport.current);

    const animate = (time: number) => {
      // This slow-moving strip needs at most 30 updates per second.
      if (previous && time - previous < 1000 / 30) { frame = requestAnimationFrame(animate); return; }
      const state = motion.current;
      const elapsed = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      const isMobile = width < 640;
      const cardWidth = isMobile ? 150 : Math.min(174, Math.max(150, width * 0.12));
      const cardHeight = isMobile ? 242 : 250;
      state.stride = cardWidth + (isMobile ? 16 : 24);
      const cycle = cards.length * state.stride;
      if (!state.paused && !state.hover && !state.focus && !state.drag && !document.hidden) {
        state.target += elapsed * 0.018;
      }
      state.offset += (state.target - state.offset) * (state.reduced ? 1 : 1 - Math.exp(-elapsed / 100));
      if (Math.abs(state.offset - state.target) < 0.01) state.offset = state.target;
      if (Math.abs(state.offset - renderedOffset) < 0.01 && width === renderedWidth) { frame = requestAnimationFrame(animate); return; }
      renderedOffset = state.offset;
      renderedWidth = width;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const position = ((index * state.stride - state.offset + cycle * 0.5) % cycle + cycle) % cycle - cycle * 0.5;
        const curve = position / Math.max(width * 0.5, 1);
        const edge = Math.min(Math.abs(curve), 1.35);
        // The center recedes; cards grow and fan outward toward either edge.
        const scale = 1 + (isMobile ? 0.24 : 0.34) * Math.pow(edge, 1.65);
        const x = position * (1 + 0.06 * edge * edge);
        const lift = -6 * edge * edge;
        const turn = Math.max(-32, Math.min(32, -curve * (isMobile ? 18 : 24)));
        const visible = Math.abs(x) < width / 2 + cardWidth * scale / 2;
        if (!visible) {
          if (card.style.visibility !== 'hidden') { card.style.visibility = 'hidden'; card.tabIndex = -1; card.setAttribute('aria-hidden', 'true'); }
          return;
        }
        if (card.style.width !== `${cardWidth}px`) card.style.width = `${cardWidth}px`;
        if (card.style.height !== `${cardHeight}px`) card.style.height = `${cardHeight}px`;
        card.style.transform = `translate3d(${x - cardWidth / 2}px, ${-cardHeight / 2 + lift}px, 0) perspective(550px) rotateY(${turn}deg) scale(${scale})`;
        const order = String(Math.round(edge * 100));
        if (card.style.zIndex !== order) card.style.zIndex = order;
        if (card.style.visibility !== 'visible') { card.style.visibility = 'visible'; card.tabIndex = 0; card.removeAttribute('aria-hidden'); }
      });
      frame = requestAnimationFrame(animate);
    };
    // Let the first photographs paint before starting decorative movement.
    // Loading remains eager; only autoplay waits for an idle rendering opportunity.
    let ready = false;
    const start = () => {
      const run = () => { ready = true; if (!frame) frame = requestAnimationFrame(animate); };
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(run, { timeout: 1500 });
      else run();
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { cancelAnimationFrame(frame); frame = 0; }
      else if (ready && !frame) { previous = 0; frame = requestAnimationFrame(animate); }
    });
    if (viewport.current) visibility.observe(viewport.current);
    return () => {
      cancelAnimationFrame(frame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.removeEventListener('load', start);
      observer.disconnect();
      visibility.disconnect();
      media.removeEventListener("change", preference);
    };
  }, [cards.length]);

  const move = (direction: number) => { motion.current.target += direction * motion.current.stride; };
  const togglePlayback = () => {
    motion.current.paused = !motion.current.paused;
    setPaused(motion.current.paused);
  };

  return (
      <div
        ref={viewport}
        className="art-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Textured art inspiration"
        aria-describedby="art-carousel-instructions"
        tabIndex={0}
        onMouseEnter={() => { motion.current.hover = true; }}
        onMouseLeave={() => { motion.current.hover = false; }}
        onFocusCapture={() => { motion.current.focus = true; }}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) motion.current.focus = false; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
          if (event.key === "Escape") {
            motion.current.paused = true;
            setPaused(true);
          }
          if (event.key === " " && event.target === event.currentTarget) {
            event.preventDefault();
            togglePlayback();
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          motion.current.drag = true;
          motion.current.lastX = event.clientX;
          motion.current.distance = 0;
        }}
        onPointerMove={(event) => {
          if (!motion.current.drag) return;
          const delta = event.clientX - motion.current.lastX;
          motion.current.target -= delta;
          motion.current.distance += Math.abs(delta);
          motion.current.lastX = event.clientX;
          if (motion.current.distance > 8 && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={() => { motion.current.drag = false; }}
        onPointerCancel={() => { motion.current.drag = false; }}
        onLostPointerCapture={() => { motion.current.drag = false; }}
        onClickCapture={(event) => { if (motion.current.distance > 8) { event.preventDefault(); motion.current.distance = 0; } }}
      >
        <p id="art-carousel-instructions" className="sr-only">Drag to explore artwork, or use the left and right arrow keys. Press Space to pause or play, or Escape to pause.</p>
        <button type="button" className="art-carousel-accessible-control" onClick={togglePlayback}>{paused ? "Play artwork animation" : "Pause artwork animation"}</button>
        {cards.map((scene, index) => (
          <Link
            key={`${scene.image}-${index}`}
            href={scene.href}
            prefetch={false}
            ref={(element) => { cardRefs.current[index] = element; }}
            className="art-carousel-card"
            style={{ '--initial-index': index > cards.length / 2 ? index - cards.length : index } as CSSProperties}
            aria-label={`${scene.title} — ${scene.href === "/custom-order" ? "commission your artwork" : "explore the gallery"}`}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            onFocus={(event) => {
              if (!event.currentTarget.matches(":focus-visible")) return;
              const cycle = cards.length * motion.current.stride;
              const destination = index * motion.current.stride;
              motion.current.target = destination + Math.round((motion.current.offset - destination) / cycle) * cycle;
            }}
          >
            <Image src={scene.image} alt={scene.alt} fill sizes="(max-width: 640px) 180px, 210px" decoding={index === 0 ? 'sync' : 'async'} fetchPriority={index === 0 ? 'high' : 'low'} loading={index === 0 ? 'eager' : 'lazy'} draggable={false} />
            <span className="art-card-title">{scene.title}</span>
          </Link>
        ))}
      </div>

  );
}
