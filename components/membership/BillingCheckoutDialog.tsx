'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, X } from 'lucide-react';
import {
  billingApi,
  type BillingSummary,
  type MembershipPlanSummary,
} from '@/lib/api';
import { publicConfig } from '@/lib/public-config';

const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export function BillingCheckoutDialog({
  plan,
  initialAddonQuantity = 0,
  onClose,
}: {
  plan: MembershipPlanSummary;
  initialAddonQuantity?: number;
  onClose: () => void;
}) {
  const [addonQuantity, setAddonQuantity] = useState(initialAddonQuantity);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [consents, setConsents] = useState([false, false, false]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    setSummary(null);
    setError(null);
    billingApi
      .summary(plan.code, addonQuantity)
      .then(setSummary)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : 'Quote tidak tersedia.',
        ),
      );
  }, [plan.code, addonQuantity]);

  const checkout = async () => {
    if (!consents.every(Boolean) || !summary || loading) return;
    setLoading(true);
    setError(null);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const result = await billingApi.checkout({
        plan: plan.code as 'lite' | 'plus' | 'pro',
        addonQuantity,
        acceptTerms: true,
        acceptPrivacy: true,
        acceptRefundPolicy: true,
        policyVersion: publicConfig.policyVersion,
        idempotencyKey: idempotencyKey.current,
      });
      if (!result.checkoutUrl) throw new Error('Hosted checkout belum tersedia.');
      const url = new URL(result.checkoutUrl);
      const configuredHosts = (
        process.env.NEXT_PUBLIC_CHECKOUT_ALLOWED_HOSTS || ''
      )
        .split(',')
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean);
      if (
        url.protocol !== 'https:' ||
        (configuredHosts.length > 0 &&
          !configuredHosts.includes(url.hostname.toLowerCase()))
      )
        throw new Error('Alamat hosted checkout tidak diizinkan.');
      window.location.assign(url.toString());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Checkout gagal.');
      setLoading(false);
    }
  };

  const maximumAddon = Math.max(
    0,
    3 - (summary?.configuration.plan.whatsappNumbers ?? 3),
  );
  const consentLabels = [
    <span key="terms">Saya menyetujui <Link className="font-bold underline" href="/legal/terms" target="_blank">Terms and Conditions</Link>.</span>,
    <span key="privacy">Saya menyetujui <Link className="font-bold underline" href="/legal/privacy" target="_blank">Privacy Policy</Link>.</span>,
    <span key="refund">Saya memahami <Link className="font-bold underline" href="/legal/refund" target="_blank">Cancellation and Refund Policy</Link>.</span>,
  ];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onKeyDown={(event) => event.key === 'Escape' && onClose()}>
      <div className="w-full max-w-lg rounded-[1.75rem] border bg-card p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-kicker">Konfirmasi membership</p><h2 id="checkout-title" className="mt-1 text-2xl font-black">{plan.name} v{plan.version}</h2></div><button type="button" onClick={onClose} aria-label="Tutup" className="rounded-full border p-2"><X className="h-4 w-4" /></button></div>
        <div className="mt-5 rounded-2xl bg-muted/60 p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-semibold"><span>Nomor WhatsApp tambahan</span><select value={addonQuantity} onChange={(event) => setAddonQuantity(Number(event.target.value))} className="rounded-lg border bg-background px-3 py-2" aria-label="Jumlah add-on nomor WhatsApp">{Array.from({ length: maximumAddon + 1 }, (_, quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}</select></label>
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">{summary?.lineItems.map((item) => <div key={item.type} className="flex justify-between gap-3"><span>{item.name} {item.quantity > 1 ? `× ${item.quantity}` : ''}</span><strong>{money(item.amount)}</strong></div>) ?? <p>Memuat quote…</p>}</div>
          {summary && <div className="mt-4 flex justify-between border-t pt-4 text-lg"><strong>Total bulanan</strong><strong>{money(summary.total)}</strong></div>}
        </div>
        <div className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground"><p>Pembayaran pertama dilakukan saat checkout dan diperpanjang otomatis setiap bulan.</p><p>{summary?.replacementDisclosure}</p><p>{summary?.providerCostNotice}</p></div>
        <div className="mt-5 space-y-3">{consentLabels.map((label, index) => <label key={index} className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={consents[index]} onChange={(event) => setConsents((current) => current.map((value, item) => item === index ? event.target.checked : value))} className="mt-1 h-4 w-4" />{label}</label>)}</div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={() => void checkout()} disabled={!summary || !consents.every(Boolean) || loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-black text-primary-foreground disabled:opacity-40">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Membuka checkout…' : 'Lanjut ke pembayaran aman'}</button>
      </div>
    </div>
  );
}
