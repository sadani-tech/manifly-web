"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { feedbackApi, whatsappV2Api } from "@/lib/api";
import type { HelpArticle } from "@/lib/help-server";

export function HelpArticleView({ article }: { article: HelpArticle }) {
  const [sent, setSent] = useState(false);
  const [examples, setExamples] = useState<Array<{ name: string; title: string; examples: string[] }>>([]);
  const lines = article.body.split(/\r?\n/);
  useEffect(() => { if (!article.intents.length) return; whatsappV2Api.commands().then((commands) => setExamples(commands.filter((command) => article.intents.includes(command.name)))).catch(() => undefined); }, [article.intents]);
  const vote = async (helpful: boolean) => { await feedbackApi.create({ type: "help", area: "Help", message: helpful ? `Panduan ${article.slug} membantu pengguna.` : `Panduan ${article.slug} belum membantu pengguna.`, rating: helpful ? 5 : 2, source: "help", helpArticleSlug: article.slug, context: { route: `/help/${article.slug}`, appVersion: "2.0" } }); setSent(true); };
  return <article className="mx-auto max-w-3xl"><Link href="/help" className="focus-ring mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link><div className="rounded-[1.5rem] border bg-card p-5 sm:p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-kicker">{article.category}</p><div className="prose-help mt-3">{lines.map((line, index) => line.startsWith("# ") ? null : line.startsWith("## ") ? <h2 key={index}>{line.slice(3)}</h2> : line ? <p key={index}>{renderInline(line)}</p> : null)}</div>{examples.length > 0 && <section className="mt-7 rounded-2xl bg-muted/60 p-4"><h2 className="font-black">Contoh WhatsApp yang aktif</h2><div className="mt-3 space-y-3">{examples.map((command) => <div key={command.name}><p className="text-sm font-bold">{command.title}</p><div className="mt-1 flex flex-wrap gap-2">{command.examples.map((example) => <code key={example} className="rounded-lg bg-card px-2.5 py-1.5 text-xs">{example}</code>)}</div></div>)}</div></section>}<div className="mt-8 border-t pt-6"><h2 className="font-black">Apakah panduan ini membantu?</h2>{sent ? <p className="mt-2 text-sm text-success">Terima kasih, jawabanmu sudah tersimpan.</p> : <div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => void vote(true)}><ThumbsUp className="h-4 w-4" /> Ya</Button><Button variant="outline" onClick={() => void vote(false)}><ThumbsDown className="h-4 w-4" /> Belum</Button></div>}</div></div></article>;
}

function renderInline(line: string) {
  const parts = line.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => { const code = part.match(/^`(.+)`$/); if (code) return <code key={index}>{code[1]}</code>; const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/); if (link) return <Link key={index} href={link[2]}>{link[1]}</Link>; return part; });
}
