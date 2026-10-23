"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, MessageCircleMore, Paperclip, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { feedbackApi, type FeedbackEntry } from "@/lib/api";

const statuses = { received: "Diterima", reviewing: "Ditinjau", planned: "Direncanakan", completed: "Selesai", declined: "Tidak dilanjutkan" } as const;
const areas = ["Dashboard", "Transactions", "Pocket", "Budget", "Recurring", "Debts", "Financial", "WhatsApp", "Membership", "Help", "Lainnya"];

export default function FeedbackPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [type, setType] = useState<FeedbackEntry["type"]>("feature");
  const [area, setArea] = useState("Dashboard");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>();
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { feedbackApi.list().then(setEntries).catch(() => setEntries([])); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const created = await feedbackApi.create({ type, area, message, rating, contactConsent: consent, source: "web", context: { route: window.location.pathname, appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0", device: /Mobi/.test(navigator.userAgent) ? "mobile" : "desktop", browser: navigator.userAgent.slice(0, 120), pwa: window.matchMedia("(display-mode: standalone)").matches } });
      if (file) await feedbackApi.attach(created.id, file);
      setEntries((current) => [{ ...created, replies: created.replies ?? [] }, ...current]); setMessage(""); setFile(null); setRating(undefined); setNotice("Masukanmu sudah diterima. Terima kasih!");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Masukan belum dapat dikirim."); } finally { setBusy(false); }
  };
  return <div className="space-y-8"><header><p className="text-xs font-black uppercase tracking-[0.16em] text-kicker">Feedback</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Kritik & Saran</h2><p className="mt-2 text-sm text-muted-foreground">Ceritakan yang mengganggu atau ide yang bisa membuat Manifly lebih berguna.</p></header><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.8fr)]"><Card><CardContent className="p-4 sm:p-6"><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Jenis<select value={type} onChange={(e) => setType(e.target.value as FeedbackEntry["type"])} className="mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3 font-normal"><option value="criticism">Kritik</option><option value="feature">Saran fitur</option><option value="bug">Laporan bug</option><option value="question">Pertanyaan</option></select></label><label className="text-sm font-bold">Area fitur<select value={area} onChange={(e) => setArea(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3 font-normal">{areas.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="block text-sm font-bold">Pesan <span className="font-normal text-muted-foreground">({message.length}/2000)</span><Textarea value={message} onChange={(e) => setMessage(e.target.value)} minLength={10} maxLength={2000} rows={7} className="mt-1.5" placeholder="Ceritakan apa yang terjadi atau perubahan yang kamu harapkan…" required /></label><fieldset><legend className="text-sm font-bold">Seberapa puas? <span className="font-normal text-muted-foreground">Opsional</span></legend><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} bintang`} className="focus-ring min-h-11 min-w-11 rounded-xl hover:bg-muted"><Star className={`mx-auto h-5 w-5 ${rating && value <= rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} /></button>)}</div></fieldset><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 text-sm"><Paperclip className="h-4 w-4" /><span className="min-w-0 flex-1 truncate">{file?.name ?? "Lampirkan screenshot (maks. 5 MB)"}</span><Input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4" /><span>Boleh hubungi saya bila tim membutuhkan detail tambahan.</span></label>{notice && <p role="status" className="rounded-xl bg-muted p-3 text-sm">{notice}</p>}<Button type="submit" disabled={busy || message.trim().length < 10}>{busy ? "Mengirim…" : "Kirim masukan"}</Button></form></CardContent></Card><section><h3 className="mb-3 text-lg font-black">Riwayat masukan</h3><div className="space-y-3">{entries.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground"><MessageCircleMore className="mx-auto mb-2 h-7 w-7" />Belum ada masukan.</div> : entries.map((entry) => <article key={entry.id} className="rounded-2xl border bg-card p-4"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{statuses[entry.status]}</span><time className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("id-ID")}</time></div><p className="mt-3 whitespace-pre-wrap text-sm">{entry.message}</p>{entry.replies?.map((reply) => <div key={reply.id} className="mt-3 rounded-xl bg-accent p-3 text-sm"><p className="font-bold">{reply.author}</p><p className="mt-1 whitespace-pre-wrap">{reply.message}</p></div>)}{entry.status === "completed" && <CheckCircle2 className="mt-3 h-4 w-4 text-success" />}</article>)}</div></section></div></div>;
}
