import type { ReactNode } from 'react';
import { PublicChrome } from './PublicChrome';

export function LegalPage({
  eyebrow,
  title,
  effectiveDate,
  children,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <PublicChrome>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[.18em] text-kicker">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm opacity-60">Berlaku sejak {effectiveDate}</p>
        <div className="mt-10 space-y-8 text-[15px] leading-7 [&_a]:font-bold [&_a]:underline [&_h2]:text-xl [&_h2]:font-black [&_li]:ml-5 [&_li]:list-disc [&_p]:opacity-80 [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </PublicChrome>
  );
}
