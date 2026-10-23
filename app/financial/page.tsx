"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, HeartPulse, Landmark, Target, WandSparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { experienceApi, type FinancialSummary } from "@/lib/api";

const features = [
  { href: "/analytics", title: "Analytics", description: "Pahami pola arus kas", icon: BarChart3, value: (data: FinancialSummary) => `${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(data.analytics.expense30Days)} keluar / 30 hari` },
  { href: "/financial-health", title: "Health", description: "Kesehatan finansial kamu", icon: HeartPulse, value: (data: FinancialSummary) => data.health?.score == null ? "Belum cukup data" : `Skor ${data.health.score}/100` },
  { href: "/plan", title: "Plan", description: "Goal, forecast, dan langganan", icon: Target, value: (data: FinancialSummary) => data.plan ? `${data.plan.name} · ${data.plan.percentage}%` : "Belum ada goal aktif" },
  { href: "/net-worth", title: "Net Worth", description: "Aset dikurangi kewajiban", icon: Landmark, value: (data: FinancialSummary) => data.netWorth ? new Intl.NumberFormat("id-ID", { style: "currency", currency: data.netWorth.currency, maximumFractionDigits: 0 }).format(data.netWorth.total) : "Belum ada snapshot" },
  { href: "/smart-rules", title: "Smart Rules", description: "Rapikan transaksi otomatis", icon: WandSparkles, value: (data: FinancialSummary) => `${data.smartRules.activeCount} aturan aktif` },
] as const;

export default function FinancialPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  useEffect(() => { experienceApi.financialSummary().then(setSummary).catch(() => setSummary(null)); }, []);
  return <div className="space-y-6 sm:space-y-8"><header><p className="text-xs font-black uppercase tracking-[0.16em] text-kicker">Financial</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pahami uangmu, rencanakan langkahmu</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Satu tempat untuk otomatisasi, perencanaan, kekayaan bersih, analisis, dan kesehatan finansial.</p></header><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{features.map(({ href, title, description, icon: Icon, value }) => <Link key={href} href={href} className="group focus-ring rounded-[1.4rem]"><Card className="h-full transition-transform group-hover:-translate-y-1"><CardContent className="flex min-h-44 flex-col p-5 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-lime text-brand-navy"><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p><div className="mt-auto flex items-end justify-between gap-3 pt-5"><p className="text-sm font-bold">{summary ? value(summary) : "Memuat ringkasan…"}</p><ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" /></div></CardContent></Card></Link>)}</div></div>;
}
