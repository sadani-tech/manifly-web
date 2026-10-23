"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Circle } from "lucide-react";
import { experienceApi, type OnboardingChecklist as Checklist } from "@/lib/api";

export function OnboardingChecklist() {
  const [data, setData] = useState<Checklist | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { Promise.all([experienceApi.checklist(), experienceApi.uiState("onboarding_checklist_collapsed")]).then(([checklist, state]) => { setData(checklist); setCollapsed(Boolean(state.value?.collapsed)); }).catch(() => setData(null)); }, []);
  if (!data || data.completed) return null;
  const toggle = () => setCollapsed((value) => { const next = !value; void experienceApi.setUiState("onboarding_checklist_collapsed", { collapsed: next }); return next; });
  return <section className="rounded-[1.4rem] border bg-card p-4 sm:p-5"><button type="button" onClick={toggle} className="focus-ring flex min-h-11 w-full items-center justify-between text-left"><div><h2 className="font-black">Mulai tanpa bingung</h2><p className="text-sm text-muted-foreground">{data.completedCount} dari {data.steps.length} langkah selesai</p></div><ChevronDown className={`h-5 w-5 transition-transform ${collapsed ? "" : "rotate-180"}`} /></button>{!collapsed && <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{data.steps.map((step) => <li key={step.key}><Link href={step.href === "/settings/accounts" ? "/pockets" : step.href} className="focus-ring flex min-h-12 items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm font-semibold hover:bg-accent">{step.completed ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}<span>{step.label}</span></Link></li>)}</ul>}</section>;
}
