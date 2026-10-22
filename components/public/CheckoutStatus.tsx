'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { billingApi, type BillingCheckout } from '@/lib/api';

const terminalStatuses = ['active', 'failed', 'expired', 'cancelled'];

const money = (value: number, currency: string) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

function remainingTime(expiresAt: string | null, now: number) {
  if (!expiresAt) return null;
  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-black/10 bg-background px-4 text-sm font-black transition hover:-translate-y-0.5 hover:border-primary/40 dark:border-white/15"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Tersalin' : label}
    </button>
  );
}

function PaymentInstructions({ checkout }: { checkout: BillingCheckout }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = remainingTime(checkout.expiresAt, now);

  return (
    <div className="mt-7 text-left">
      <div className="rounded-2xl border-2 border-black/10 bg-muted/45 p-4 dark:border-white/10 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-kicker">
              Total pembayaran
            </p>
            <p className="mt-1 text-2xl font-black">
              {money(checkout.amount, checkout.currency)}
            </p>
          </div>
          {countdown && (
            <div className="flex items-center gap-2 rounded-full bg-background px-3 py-2 text-sm font-bold">
              <Clock3 className="h-4 w-4 text-kicker" />
              <span aria-label={`Sisa waktu pembayaran ${countdown}`}>{countdown}</span>
            </div>
          )}
        </div>
      </div>

      {checkout.qrString && (
        <div className="mt-5 rounded-3xl border-2 border-black/10 bg-white p-5 text-center text-[#151515] dark:border-white/10 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#405500]">QRIS</p>
          <h2 className="mt-1 text-xl font-black">Pindai untuk membayar</h2>
          <div className="mx-auto mt-5 w-fit rounded-2xl border-8 border-white bg-white p-2 shadow-sm">
            <QRCodeSVG
              value={checkout.qrString}
              size={240}
              level="M"
              marginSize={1}
              title="Kode QRIS pembayaran Manifly"
              className="h-auto w-[min(68vw,240px)]"
            />
          </div>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/65">
            Buka aplikasi bank atau dompet digital, pilih menu QRIS, lalu pindai kode di atas.
          </p>
          <div className="mt-4">
            <CopyButton value={checkout.qrString} label="Salin kode QRIS" />
          </div>
        </div>
      )}

      {!checkout.qrString && checkout.vaNumber && (
        <div className="mt-5 rounded-3xl border-2 border-black/10 bg-card p-5 text-center dark:border-white/10 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.16em] text-kicker">
            Virtual Account
          </p>
          <p className="mt-3 break-all font-mono text-2xl font-black tracking-wider sm:text-3xl">
            {checkout.vaNumber}
          </p>
          <div className="mt-5">
            <CopyButton value={checkout.vaNumber} label="Salin nomor VA" />
          </div>
          <ol className="mt-6 space-y-2 text-left text-sm leading-6 text-muted-foreground">
            <li>1. Buka aplikasi bank dan pilih pembayaran Virtual Account.</li>
            <li>2. Masukkan nomor VA di atas dan periksa nominalnya.</li>
            <li>3. Selesaikan pembayaran sebelum masa berlaku berakhir.</li>
          </ol>
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Membership hanya aktif setelah pembayaran dikonfirmasi oleh penyedia. Jangan bagikan
          kode pembayaran atau membayar nominal yang berbeda.
        </p>
      </div>
    </div>
  );
}

export function CheckoutStatus() {
  const params = useSearchParams();
  const reference = params.get('reference');
  const [checkout, setCheckout] = useState<BillingCheckout | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!reference) return null;
    setChecking(true);
    try {
      const next = await billingApi.checkoutStatus(reference);
      setCheckout(next);
      setError(null);
      return next;
    } catch {
      setError('Status belum dapat diverifikasi. Coba beberapa saat lagi.');
      return null;
    } finally {
      setChecking(false);
    }
  }, [reference]);

  useEffect(() => {
    if (!reference) {
      setError('Reference checkout tidak tersedia.');
      return;
    }
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const poll = async () => {
      attempts += 1;
      const next = await loadStatus();
      if (cancelled || (next && terminalStatuses.includes(next.status))) return;
      if (attempts >= 60) {
        if (!cancelled) setTimedOut(true);
        return;
      }
      timer = window.setTimeout(poll, 5000);
    };
    void poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [loadStatus, reference]);

  const active = checkout?.status === 'active';
  const terminalFailure = checkout
    ? ['failed', 'expired', 'cancelled'].includes(checkout.status)
    : false;
  const awaitingPayment = checkout
    ? ['pending', 'verifying', 'retryable'].includes(checkout.status)
    : false;

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border-2 border-black/15 bg-white p-6 text-center shadow-[9px_9px_0_#c9f45a] dark:border-white/10 dark:bg-[#111827] sm:p-10">
      {active ? (
        <CircleCheck className="mx-auto h-14 w-14 text-emerald-600" />
      ) : terminalFailure ? (
        <CircleX className="mx-auto h-14 w-14 text-red-500" />
      ) : (
        <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-kicker" />
      )}
      <h1 className="mt-5 text-3xl font-black">
        {active
          ? 'Membership aktif'
          : terminalFailure
            ? 'Pembayaran belum berhasil'
            : checkout
              ? 'Selesaikan pembayaran'
              : 'Menyiapkan pembayaran'}
      </h1>
      <p className="mt-3 leading-7 opacity-65">
        {active
          ? 'Pembayaran sudah terverifikasi dan entitlement telah diperbarui.'
          : terminalFailure
            ? 'Tidak ada perubahan pada membership lamamu. Kamu dapat mencoba checkout lagi.'
            : timedOut
              ? 'Verifikasi memerlukan waktu lebih lama. Kamu dapat kembali nanti; status tetap diproses di server.'
              : 'Status diperiksa otomatis. Halaman ini aman ditutup dan dibuka kembali dari menu Membership.'}
      </p>

      {awaitingPayment && checkout && <PaymentInstructions checkout={checkout} />}

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {reference && (
        <p className="mt-5 break-all font-mono text-xs opacity-50">Referensi: {reference}</p>
      )}
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {!active && !terminalFailure && (
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={checking}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-black/10 px-5 font-black disabled:opacity-50 dark:border-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Cek status sekarang
          </button>
        )}
        <Link
          href="/settings/membership"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#151515] px-5 font-black text-white dark:bg-brand-lime dark:text-brand-navy"
        >
          Buka Membership
        </Link>
      </div>
    </div>
  );
}
