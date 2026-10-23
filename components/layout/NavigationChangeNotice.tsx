"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { experienceApi } from "@/lib/api";

export function NavigationChangeNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { experienceApi.uiState("nav_financial_tooltip").then((state) => setVisible(!state.value?.seen)).catch(() => undefined); }, []);
  const close = () => { setVisible(false); void experienceApi.setUiState("nav_financial_tooltip", { seen: true }); };
  if (!visible) return null;
  return <aside role="status" className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto max-w-md rounded-2xl border border-brand-lime/50 bg-brand-navy p-4 text-white shadow-2xl md:bottom-5 md:left-auto md:right-5"><button type="button" onClick={close} aria-label="Tutup info perubahan" className="focus-ring absolute right-2 top-2 rounded-lg p-2 text-white/60 hover:bg-white/10"><X className="h-4 w-4" /></button><p className="pr-8 text-sm font-bold">Navigasi sekarang lebih ringkas</p><p className="mt-1 text-xs leading-relaxed text-white/65">Analytics, Plan, Net Worth, Health, dan Smart Rules sekarang ada di <strong className="text-white">Financial</strong>.</p><Link href="/financial" onClick={close} className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-brand-lime px-3 text-xs font-black text-brand-navy">Lihat Financial</Link></aside>;
}
