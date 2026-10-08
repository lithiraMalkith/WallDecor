import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[#EBE8E4] bg-[#F5F3F1]">
        <div className="container-x py-14 md:py-20">
          <p className="eyebrow text-[#777169]">{eyebrow}</p>
          <h1 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#000000] mt-3 max-w-4xl leading-[1.05]">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#59544F] font-normal leading-relaxed">
              {intro}
            </p>
          )}
        </div>
      </header>
      <div className="container-x py-14 md:py-20">{children}</div>
    </>
  );
}
