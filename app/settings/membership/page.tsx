"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgePlus,
  Check,
  Clock3,
  Crown,
  LockKeyhole,
  MessageSquare,
  Mic2,
  Send,
  Smartphone,
} from "lucide-react";
import {
  membershipApi,
  type MembershipAddonSummary,
  type MembershipPlanSummary,
  type MembershipSnapshot,
  type MembershipUsage,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const ENTITLEMENTS = [
  { key: "whatsapp.numbers", label: "Nomor WhatsApp", icon: Smartphone },
  {
    key: "whatsapp.chat_actions",
    label: "Chat action / bulan",
    icon: MessageSquare,
  },
  { key: "whatsapp.voice_seconds", label: "Voice note / bulan", icon: Mic2 },
  {
    key: "whatsapp.proactive_deliveries",
    label: "Pesan proaktif / bulan",
    icon: Send,
  },
] as const;

function formatEntitlement(key: string, value: number) {
  if (key === "whatsapp.voice_seconds")
    return `${Math.floor(value / 60)} menit`;
  return value.toLocaleString("id-ID");
}

function formatPrice(value: number, currency: string) {
  if (value === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MembershipPage() {
  const [membership, setMembership] = useState<MembershipSnapshot | null>(null);
  const [plans, setPlans] = useState<MembershipPlanSummary[]>([]);
  const [addons, setAddons] = useState<MembershipAddonSummary[]>([]);
  const [usage, setUsage] = useState<MembershipUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [numberRequirement, setNumberRequirement] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "whatsapp-number-limit") {
      const required = Number(params.get("required"));
      if (Number.isFinite(required) && required > 0)
        setNumberRequirement(required);
    }

    Promise.all([
      membershipApi.get(),
      membershipApi.plans(),
      membershipApi.addons(),
      membershipApi.usage(),
    ])
      .then(([current, availablePlans, availableAddons, currentUsage]) => {
        setMembership(current);
        setPlans(availablePlans);
        setAddons(availableAddons);
        setUsage(currentUsage);
      })
      .catch(() =>
        setError("Membership belum dapat dimuat. Coba lagi beberapa saat."),
      )
      .finally(() => setLoading(false));
  }, []);

  const recommendedPlan = useMemo(() => {
    if (!numberRequirement) return null;
    return plans.find(
      (plan) =>
        (plan.entitlements["whatsapp.numbers"] ?? 0) >= numberRequirement,
    );
  }, [numberRequirement, plans]);

  const usageByKey = new Map(usage.map((item) => [item.key, item]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-2 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-kicker">
            <Crown className="h-4 w-4" /> Membership
          </p>
          <h1 className="text-3xl font-black tracking-[-0.03em]">
            Plan yang tumbuh bersamamu
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Bandingkan entitlement WhatsApp dan pantau pemakaian. Semua fitur
            finansial web tetap tersedia pada setiap plan.
          </p>
        </div>
        <Link
          href="/settings"
          className="focus-ring inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>
      </div>

      {numberRequirement && (
        <div className="rounded-2xl border border-brand-lime/70 bg-brand-lime/15 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-bold">
              Kamu membutuhkan {numberRequirement} nomor WhatsApp
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambahkan add-on nomor pada plan aktif atau pilih plan{" "}
              {recommendedPlan?.name ?? "berikutnya"}. Nomor yang sudah
              terhubung tetap aman.
            </p>
          </div>
          <Link
            href="/settings/whatsapp"
            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4 sm:mt-0"
          >
            Kembali ke WhatsApp
          </Link>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Memuat membership"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-[1.65rem] bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const active = membership?.plan.code === plan.code;
            const recommended = recommendedPlan?.code === plan.code && !active;
            return (
              <section
                key={plan.code}
                className={cn(
                  "mf-card relative flex flex-col rounded-[1.65rem] border bg-card p-5",
                  active
                    ? "border-brand-lime ring-2 ring-brand-lime/45"
                    : "border-border",
                  recommended && "border-brand-blue/50",
                )}
              >
                {(active || recommended) && (
                  <span
                    className={cn(
                      "absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                      active
                        ? "bg-brand-lime text-brand-navy"
                        : "bg-brand-blue text-white",
                    )}
                  >
                    {active ? "Plan aktif" : "Sesuai kebutuhanmu"}
                  </span>
                )}
                <h2 className="pr-24 text-2xl font-black">{plan.name}</h2>
                <p className="mt-2 text-xl font-black text-foreground">
                  {formatPrice(plan.priceMonthly, plan.currency)}
                  {plan.priceMonthly > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                      /bulan
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.code === "free"
                    ? "Mulai mencatat lewat WhatsApp."
                    : plan.code === "lite"
                      ? "Lebih banyak chat untuk kebutuhan personal."
                      : "Kapasitas lebih besar untuk aktivitasmu."}
                </p>
                <div className="my-5 h-px bg-border" />
                <ul className="flex-1 space-y-3">
                  {ENTITLEMENTS.map(({ key, label, icon: Icon }) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-muted-foreground">
                        {label}
                      </span>
                      <strong>
                        {formatEntitlement(key, plan.entitlements[key] ?? 0)}
                      </strong>
                    </li>
                  ))}
                </ul>
                {active ? (
                  <div className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-muted text-sm font-bold">
                    <Check className="h-4 w-4" /> Sedang digunakan
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-6 flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border bg-muted/70 text-sm font-bold text-muted-foreground opacity-80"
                  >
                    <LockKeyhole className="h-4 w-4" /> Pembayaran belum
                    tersedia
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}

      {!loading && addons.length > 0 && (
        <section className="mf-card rounded-[1.65rem] border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/30 text-brand-navy dark:text-brand-lime">
              <BadgePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black">Add-on plan aktif</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tambah kapasitas nomor tanpa mengganti plan. Total nomor tetap
                mengikuti batas platform.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {addons.map((addon) => {
              const activeAddon = membership?.addons?.find(
                (item) => item.code === addon.code,
              );
              const baseLimit = plans.find(
                (plan) => plan.code === membership?.plan.code,
              )?.entitlements[addon.entitlementKey] ?? 0;
              const maximumQuantity = addon.platformLimit
                ? Math.max(
                    0,
                    Math.floor(
                      (addon.platformLimit - baseLimit) /
                        addon.entitlementIncrement,
                    ),
                  )
                : null;
              const availableQuantity =
                maximumQuantity === null
                  ? null
                  : Math.max(0, maximumQuantity - (activeAddon?.quantity ?? 0));
              return (
                <article
                  key={addon.code}
                  className="rounded-2xl border bg-muted/35 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{addon.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        +{addon.entitlementIncrement} nomor aktif per unit
                      </p>
                    </div>
                    <p className="text-right font-black">
                      {formatPrice(addon.priceMonthly, addon.currency)}
                      <span className="block text-[10px] font-medium text-muted-foreground">
                        /nomor/bulan
                      </span>
                    </p>
                  </div>
                  {activeAddon && (
                    <p className="mt-3 rounded-lg bg-brand-lime/20 px-3 py-2 text-xs font-semibold">
                      Aktif: {activeAddon.quantity} nomor tambahan
                    </p>
                  )}
                  {availableQuantity !== null && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Tersedia {availableQuantity} unit lagi untuk plan aktif.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled
                    className="mt-4 flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border bg-muted/70 text-sm font-bold text-muted-foreground opacity-80"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {availableQuantity === 0
                      ? "Batas 3 nomor tercapai"
                      : "Pembayaran belum tersedia"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {membership && (
        <section className="mf-card rounded-[1.65rem] border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Pemakaian periode ini</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan {membership.plan.name} · versi {membership.plan.version}
              </p>
            </div>
            <p className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
              <Clock3 className="h-3.5 w-3.5" /> Reset{" "}
              {new Date(membership.resetAt).toLocaleDateString("id-ID", {
                dateStyle: "long",
                timeZone: "Asia/Jakarta",
              })}
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ENTITLEMENTS.slice(1).map(({ key, label }) => {
              const item = usageByKey.get(key);
              const percent = item?.limit
                ? Math.min(100, (item.used / item.limit) * 100)
                : 0;
              return (
                <div key={key} className="rounded-2xl bg-muted/45 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{label}</span>
                    <strong>
                      {formatEntitlement(key, item?.remaining ?? 0)} tersisa
                    </strong>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percent >= 90
                          ? "bg-destructive"
                          : percent >= 70
                            ? "bg-amber-500"
                            : "bg-brand-lime",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatEntitlement(key, item?.used ?? 0)} dari{" "}
                    {formatEntitlement(key, item?.limit ?? 0)} digunakan
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {membership.pricingNotice}
          </p>
        </section>
      )}
    </div>
  );
}
