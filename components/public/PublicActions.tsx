'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export function PublicActions() {
  const token = useAuthStore((state) => state.token);
  return token ? (
    <Link
      href="/dashboard"
      className="rounded-full bg-brand-lime px-4 py-2 text-sm font-black text-brand-navy"
    >
      Buka dashboard
    </Link>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/login" className="px-3 py-2 text-sm font-bold">
        Masuk
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-brand-lime px-4 py-2 text-sm font-black text-brand-navy"
      >
        Daftar gratis
      </Link>
    </div>
  );
}
