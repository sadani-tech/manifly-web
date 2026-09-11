'use client';

import { useEffect, useState } from 'react';
import { billingApi } from '@/lib/api';

type SubscriptionResult = Awaited<ReturnType<typeof billingApi.subscription>>;

const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('id-ID', {
        dateStyle: 'long',
        timeZone: 'Asia/Jakarta',
      })
    : '—';

export function BillingLifecyclePanel() {
  const [data, setData] = useState<SubscriptionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [reason, setReason] = useState('');

  const load = () => billingApi.subscription().then(setData).catch(() => null);
  useEffect(() => {
    void load();
  }, []);
  if (!data?.subscription) return null;
  const subscription = data.subscription;
  const latestPaidCycle = subscription.cycles.find(
    (cycle) => cycle.status === 'SUCCEEDED',
  );

  const run = async (action: 'cancel' | 'resume') => {
    setBusy(true);
    setMessage(null);
    try {
      if (action === 'cancel') await billingApi.cancel();
      else await billingApi.resume();
      await load();
      setMessage(
        action === 'cancel'
          ? 'Auto-renew dihentikan. Akses tetap aktif sampai paid-through date.'
          : 'Pembatalan berhasil dicabut.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operasi gagal.');
    } finally {
      setBusy(false);
    }
  };

  const refund = async () => {
    if (!latestPaidCycle || reason.trim().length < 10) return;
    setBusy(true);
    try {
      const result = await billingApi.requestRefund({
        paymentReference: latestPaidCycle.reference,
        requestedAmount: latestPaidCycle.amount,
        reason: reason.trim(),
      });
      setMessage(result.message);
      setShowRefund(false);
      setReason('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Permintaan gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mf-card rounded-[1.65rem] border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-lg font-black">Billing subscription</h2><p className="mt-1 text-sm text-muted-foreground">Status {subscription.status} · akses dibayar sampai {date(subscription.paidThrough)}</p></div>
        {subscription.status === 'cancelled' ? (
          <button type="button" disabled={busy} onClick={() => void run('resume')} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Batalkan cancellation</button>
        ) : (
          <button type="button" disabled={busy} onClick={() => void run('cancel')} className="rounded-xl border border-destructive/30 px-4 py-2 text-sm font-bold text-destructive disabled:opacity-50">Hentikan auto-renew</button>
        )}
      </div>
      {latestPaidCycle && <button type="button" onClick={() => setShowRefund((value) => !value)} className="mt-4 text-sm font-bold underline underline-offset-4">Ajukan refund pembayaran terakhir</button>}
      {showRefund && latestPaidCycle && <div className="mt-4 space-y-3 rounded-2xl bg-muted/50 p-4"><p className="text-sm">Permintaan sebesar {new Intl.NumberFormat('id-ID', { style: 'currency', currency: latestPaidCycle.currency, maximumFractionDigits: 0 }).format(latestPaidCycle.amount)} akan ditinjau manual.</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Jelaskan alasan refund (minimal 10 karakter)" className="w-full rounded-xl border bg-background p-3 text-sm" /><button type="button" disabled={busy || reason.trim().length < 10} onClick={() => void refund()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40">Kirim permintaan</button></div>}
      {message && <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm">{message}</p>}
    </section>
  );
}
