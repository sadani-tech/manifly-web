"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, MessageCircle, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/shared/Modal";
import { whatsappV2Api, type WhatsappChallenge, type WhatsappStatus } from "@/lib/api";
import { v2Flags } from "@/lib/featureFlags";

export function WhatsappConnectBanner() {
  const [status, setStatus] = useState<WhatsappStatus | null>(null);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Pribadi");
  const [challenge, setChallenge] = useState<WhatsappChallenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { whatsappV2Api.status().then(setStatus).catch(() => setStatus(null)); }, []);
  useEffect(() => {
    if (!challenge?.challengeId || challenge.status === "connected") return;
    const timer = window.setInterval(() => {
      whatsappV2Api.challengeStatus(challenge.challengeId).then((result) => {
        setChallenge((current) => current ? { ...current, ...result } : result);
        if (result.status === "connected") {
          whatsappV2Api.status().then(setStatus);
          window.clearInterval(timer);
        }
      }).catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [challenge?.challengeId, challenge?.status]);

  if (!v2Flags.whatsappBanner || !status || status.state === "connected" || status.state === "channel_unavailable") return null;

  const start = async () => {
    setBusy(true); setError("");
    try { setChallenge(await whatsappV2Api.challenge(label)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Kode belum dapat dibuat."); }
    finally { setBusy(false); }
  };

  if (compact) return <button type="button" onClick={() => { setCompact(false); setOpen(true); }} className="focus-ring flex min-h-11 w-fit items-center gap-2 rounded-full border border-amber-500/40 bg-amber-50 px-4 text-sm font-bold text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"><MessageCircle className="h-4 w-4" /> Hubungkan WhatsApp <ChevronRight className="h-4 w-4" /></button>;

  return (
    <>
      <section className="rounded-[1.4rem] border border-amber-500/45 bg-amber-50 p-4 text-amber-950 shadow-sm dark:bg-amber-950/30 dark:text-amber-100 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/30"><MessageCircle className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 className="font-black">{status.state === "restricted" ? "Nomor WhatsApp kamu dibatasi" : "WhatsApp kamu belum terhubung"}</h2><p className="mt-1 text-sm leading-relaxed opacity-80">Hubungkan sekarang supaya bisa catat cukup dengan chat, misalnya <code>kopi 15rb</code>, atau kirim voice note.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => setOpen(true)}>Hubungkan WhatsApp</Button><Button variant="outline" onClick={() => setCompact(true)}>Nanti saja</Button></div></div>
          <button type="button" aria-label="Ciutkan" onClick={() => setCompact(true)} className="focus-ring rounded-lg p-2 hover:bg-amber-900/10"><X className="h-4 w-4" /></button>
        </div>
      </section>
      <Modal open={open} onClose={() => setOpen(false)} title="Hubungkan WhatsApp">
        {challenge?.status === "connected" ? <div className="py-5 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-success" /><h3 className="mt-3 text-xl font-black">WhatsApp terhubung 🎉</h3><p className="mt-2 text-sm text-muted-foreground">Coba kirim: <code>kopi 15rb</code>, <code>saldo</code>, atau <code>menu</code>.</p></div> : challenge?.waMeUrl ? <div className="space-y-4"><div className="mx-auto w-fit rounded-2xl bg-white p-3"><QRCodeSVG value={challenge.waMeUrl} size={180} /></div><p className="text-center text-sm text-muted-foreground">Scan QR atau buka WhatsApp. Jangan ubah pesan yang sudah terisi.</p><a href={challenge.waMeUrl} target="_blank" rel="noreferrer"><Button className="w-full">Buka WhatsApp</Button></a><p className="text-center text-xs text-muted-foreground">Menunggu koneksi… kode kedaluwarsa {new Date(challenge.expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p></div> : <div className="space-y-4"><div><label htmlFor="wa-label" className="mb-1.5 block text-sm font-bold">Label nomor</label><Input id="wa-label" value={label} maxLength={30} onChange={(event) => setLabel(event.target.value)} /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={busy || label.trim().length < 2} onClick={start}>{busy ? "Membuat kode…" : "Buat kode koneksi"}</Button></div>}
      </Modal>
    </>
  );
}
