"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { waNotificationsApi, type WaNotificationSettings } from "@/lib/api";
import { Label } from "@/components/ui/label";

export function WhatsAppDailyReminder() {
  const [settings, setSettings] = useState<WaNotificationSettings | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { waNotificationsApi.get().then(setSettings).catch(() => setMessage("Gagal memuat pengaturan WhatsApp.")); }, []);
  const update = async (patch: Partial<WaNotificationSettings>) => {
    if (!settings) return;
    const snapshot = settings;
    setSettings({ ...settings, ...patch });
    setSaving(true);
    try {
      setSettings(await waNotificationsApi.update(patch));
      setMessage("Pengaturan WhatsApp tersimpan.");
    } catch {
      setSettings(snapshot);
      setMessage("Gagal menyimpan pengaturan WhatsApp. Perubahan dibatalkan.");
    } finally {
      setSaving(false);
    }
  };
  if (!settings) return message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null;
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <div><Label htmlFor="wa-daily-reminder" className="flex cursor-pointer items-center gap-2 text-base font-semibold"><MessageCircle className="h-4 w-4" />Reminder WhatsApp</Label><p className="text-sm text-muted-foreground">Dikirim hanya bila belum ada transaksi hari ini.</p></div>
        <button id="wa-daily-reminder" type="button" role="switch" aria-label="Aktifkan reminder WhatsApp harian" aria-checked={settings.notifyDailyInput} disabled={saving} onClick={() => update({ notifyDailyInput: !settings.notifyDailyInput })} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-50 ${settings.notifyDailyInput ? "bg-brand-lime" : "bg-muted-foreground/30"}`}><span aria-hidden className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full border border-black/10 bg-white shadow-sm transition-transform ${settings.notifyDailyInput ? "translate-x-5" : "translate-x-0"}`} /></button>
      </div>
      <input aria-label="Waktu reminder WhatsApp" type="time" disabled={!settings.notifyDailyInput || saving} value={settings.dailyInputTime} onChange={(event) => update({ dailyInputTime: event.target.value })} className="w-full rounded-md border bg-background px-3 py-2 disabled:opacity-40" />
      {message && <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{message}</p>}
    </section>
  );
}
