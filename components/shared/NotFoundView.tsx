"use client";

import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export const NotFoundView: React.FC = () => (
  <div className="app-canvas flex min-h-[min(680px,calc(100vh-7rem))] items-center justify-center px-4 py-12">
    <main className="w-full max-w-lg text-center">
      <div className="mx-auto flex w-fit items-center justify-center rounded-[1.5rem] border border-brand-navy/15 bg-card/90 p-3 shadow-[5px_6px_0_color-mix(in_srgb,var(--brand-navy)_13%,transparent)]">
        <Logo size={52} hideTagline />
      </div>
      <p className="mt-8 text-7xl font-black leading-none tracking-[-0.08em] text-brand-lime [text-shadow:3px_3px_0_var(--brand-navy)] sm:text-8xl">
        404
      </p>
      <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-lime">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
        Halaman ini sedang terbang entah ke mana.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Alamat yang kamu buka tidak ditemukan. Kembali ke dashboard atau ke
        halaman sebelumnya untuk melanjutkan.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/dashboard"
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-lime px-5 text-sm font-black text-brand-navy shadow-[4px_4px_0_color-mix(in_srgb,var(--brand-navy)_16%,transparent)] transition-transform hover:-translate-y-0.5"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Ke dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali
        </button>
      </div>
    </main>
  </div>
);
