'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react';
import { billingApi, type BillingCheckout } from '@/lib/api';

export function CheckoutStatus() {
  const params = useSearchParams();
  const reference = params.get('reference');
  const [checkout, setCheckout] = useState<BillingCheckout | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError('Reference checkout tidak tersedia.');
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const next = await billingApi.checkoutStatus(reference);
        if (cancelled) return;
        setCheckout(next);
        if (['active', 'failed', 'expired', 'cancelled'].includes(next.status))
          return;
      } catch {
        if (!cancelled) setError('Status belum dapat diverifikasi.');
      }
      if (attempts >= 24) {
        if (!cancelled) setTimedOut(true);
        return;
      }
      window.setTimeout(poll, 5000);
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  const active = checkout?.status === 'active';
  const terminalFailure = checkout
    ? ['failed', 'expired', 'cancelled'].includes(checkout.status)
    : false;
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-black/15 bg-white p-7 text-center shadow-[9px_9px_0_#c9f45a] dark:border-white/10 dark:bg-white/5 sm:p-10">
      {active ? (
        <CircleCheck className="mx-auto h-14 w-14 text-emerald-600" />
      ) : terminalFailure || error ? (
        <CircleX className="mx-auto h-14 w-14 text-red-500" />
      ) : (
        <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-kicker" />
      )}
      <h1 className="mt-5 text-3xl font-black">
        {active
          ? 'Membership aktif'
          : terminalFailure
            ? 'Pembayaran belum berhasil'
            : 'Sedang memverifikasi pembayaran'}
      </h1>
      <p className="mt-3 leading-7 opacity-65">
        {active
          ? 'Pembayaran sudah terverifikasi dan entitlement telah diperbarui.'
          : terminalFailure
            ? 'Tidak ada perubahan pada membership lamamu. Kamu dapat mencoba checkout lagi.'
            : timedOut
              ? 'Verifikasi memerlukan waktu lebih lama. Status tetap diproses dengan aman di server.'
              : error || 'Jangan tutup halaman ini. Redirect checkout tidak pernah mengaktifkan plan sendiri.'}
      </p>
      {reference && <p className="mt-4 break-all font-mono text-xs opacity-50">{reference}</p>}
      <Link href="/settings/membership" className="mt-7 inline-flex rounded-full bg-[#151515] px-5 py-3 font-black text-white dark:bg-brand-lime dark:text-brand-navy">Buka Membership</Link>
    </div>
  );
}
