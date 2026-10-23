"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { HelpArticle } from "@/lib/help-server";

export function HelpCenterClient({ articles }: { articles: HelpArticle[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => { const value = query.trim().toLowerCase(); return value ? articles.filter((article) => `${article.title} ${article.category} ${article.keywords.join(" ")} ${article.body}`.toLowerCase().includes(value)) : articles; }, [articles, query]);
  const groups = useMemo(() => Map.groupBy(filtered, (article) => article.category), [filtered]);
  return <div className="space-y-7"><div className="relative max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 pl-11" placeholder="Cari fitur, pertanyaan, atau perintah WhatsApp…" aria-label="Cari panduan" /></div>{filtered.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">Panduan belum ditemukan</p><p className="mt-1 text-sm text-muted-foreground">Coba kata lain atau kirim pertanyaan lewat Feedback.</p><Link href="/feedback" className="mt-4 inline-flex text-sm font-bold underline">Buka Kritik & Saran</Link></div> : Array.from(groups.entries()).map(([category, items]) => <section key={category}><h2 className="mb-3 text-lg font-black">{category}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((article) => <Link key={article.slug} href={`/help/${article.slug}`} className="group focus-ring flex min-h-28 flex-col rounded-2xl border bg-card p-4 transition-transform hover:-translate-y-0.5"><h3 className="font-bold">{article.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.body.split("\n").find((line) => line && !line.startsWith("#"))}</p><ArrowRight className="mt-auto h-4 w-4 self-end transition-transform group-hover:translate-x-1" /></Link>)}</div></section>)}</div>;
}
