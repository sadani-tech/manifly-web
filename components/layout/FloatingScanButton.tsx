"use client";

import Link from "next/link";
import { Plus, ScanLine } from "lucide-react";
import { useAccountStore } from "@/store/accountStore";

/**
 * Mobile-only shortcuts for scanning and adding a transaction. Hidden when
 * the selected pocket is read-only. They sit above the bottom navigation and
 * respect the device safe area.
 */
export const FloatingScanButton: React.FC = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const active = accounts.find((account) => account.id === activeAccountId);

  if (!active || active.role === "viewer") {
    return null;
  }

  return (
    <div className="fixed right-4 z-30 flex items-center gap-3 md:hidden bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]">
      <Link
        href="/import"
        aria-label="Scan struk"
        title="Scan struk"
        className="neo-sticker focus-ring group flex h-13 w-13 items-center justify-center rounded-full bg-card text-brand-navy shadow-[0_16px_32px_rgba(0,0,0,.16)] transition-transform hover:-translate-y-1 active:scale-95 dark:text-brand-lime"
      >
        <ScanLine className="h-5 w-5 transition-transform group-hover:scale-110" />
      </Link>
      <Link
        href="/transactions?add=1"
        aria-label="Tambah transaksi"
        title="Tambah transaksi"
        className="neo-sticker focus-ring group flex h-14 w-14 items-center justify-center rounded-full bg-brand-lime text-brand-navy shadow-[5px_6px_0_color-mix(in_srgb,var(--brand-navy)_25%,transparent),0_18px_34px_color-mix(in_srgb,var(--brand-navy)_20%,transparent)] transition-[transform,box-shadow] hover:-translate-y-1 hover:-rotate-3 active:translate-y-1 active:scale-95"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:scale-110" />
      </Link>
    </div>
  );
};
