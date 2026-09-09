"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Link,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  Unlink,
} from "lucide-react";
import { FlowBuddy } from "@/components/shared/FlowBuddy";

interface WaPhoneNumber {
  id: string;
  phone: string;
  label: string;
  isPrimary: boolean;
  notificationsEnabled: boolean;
  linkedAt: string;
  lastInboundAt: string | null;
  state: "active" | "restricted" | "revoked";
  restrictionGraceEndsAt: string | null;
}

interface MembershipUsage {
  key: string;
  limit: number;
  used: number;
  reserved: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  sourcePlanVersion: string;
}

interface MembershipQuota {
  status: string;
  plan: { code: string; name: string; version: number };
  resetAt: string;
  pricingNotice: string;
  usage: MembershipUsage[];
}

interface WaStatus {
  linked: boolean;
  phone: string | null;
  linkedAt: string | null;
  limit: number;
  numbers: WaPhoneNumber[];
}

interface NotificationPrefs {
  notifyMonthlyRecap: boolean;
  notifyOverBudget: boolean;
  notifyDebtDue: boolean;
}

interface LinkChallenge {
  linkUrl: string;
  businessPhone: string;
  expiresAt: string;
  label: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const PREF_LABELS: {
  key: keyof NotificationPrefs;
  label: string;
  desc: string;
}[] = [
  {
    key: "notifyMonthlyRecap",
    label: "Rekap awal bulan",
    desc: "Ringkasan bulan lalu setiap tanggal 1",
  },
  {
    key: "notifyOverBudget",
    label: "Alert budget terlampaui",
    desc: "Peringatan saat pengeluaran melebihi budget",
  },
  {
    key: "notifyDebtDue",
    label: "Pengingat jatuh tempo utang",
    desc: "Ingatkan H-1 dan hari-H utang piutang",
  },
];

export default function WhatsAppSettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<WaStatus | null>(null);
  const [quota, setQuota] = useState<MembershipQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [unlinkTarget, setUnlinkTarget] = useState<WaPhoneNumber | null>(null);
  const [unlinkPassword, setUnlinkPassword] = useState("");
  const [linkChallenge, setLinkChallenge] = useState<LinkChallenge | null>(
    null,
  );
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [updatingPref, setUpdatingPref] = useState<
    keyof NotificationPrefs | null
  >(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // The settings snapshot is loaded once when this client page mounts.
  useEffect(() => {
    void fetchStatus();
    void fetchQuota();
    void fetchPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function authHeaders(json = false): HeadersInit {
    const token = localStorage.getItem("mf:token");
    return {
      Authorization: `Bearer ${token}`,
      ...(json ? { "Content-Type": "application/json" } : {}),
    };
  }

  async function readError(res: Response, fallback: string) {
    const body = await res.json().catch(() => ({}));
    return Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? fallback);
  }

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/whatsapp/numbers`, {
        headers: authHeaders(),
      });
      if (res.ok) setStatus(await res.json());
      else
        setMessage({
          type: "error",
          text: await readError(res, "Gagal memuat nomor WhatsApp."),
        });
    } catch {
      setMessage({ type: "error", text: "Gagal memuat nomor WhatsApp." });
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrefs() {
    try {
      const res = await fetch(`${API_BASE}/users/notifications`, {
        headers: authHeaders(),
      });
      if (res.ok) setPrefs(await res.json());
    } catch {
      // Preferences are optional when WhatsApp is not configured.
    }
  }

  async function fetchQuota() {
    try {
      const res = await fetch(`${API_BASE}/users/whatsapp/quota`, {
        headers: authHeaders(),
      });
      if (res.ok) setQuota(await res.json());
    } catch {
      // Number management remains usable if the quota summary is unavailable.
    }
  }

  async function handleLink() {
    const currentNumbers = status?.numbers.length ?? 0;
    if (status && currentNumbers >= status.limit) {
      router.push(
        `/settings/membership?source=whatsapp-number-limit&required=${currentNumbers + 1}`,
      );
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/users/whatsapp/numbers/challenge`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ label: newLabel.trim() || undefined }),
      });
      if (!res.ok) {
        setMessage({
          type: "error",
          text: await readError(res, "Gagal membuat link WhatsApp."),
        });
        return;
      }
      setLinkChallenge(await res.json());
      setNewLabel("");
      setMessage({
        type: "success",
        text: "Link siap. Kirim pesan yang sudah disiapkan dari nomor baru.",
      });
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateNumber(
    id: string,
    update: Partial<Pick<WaPhoneNumber, "label" | "notificationsEnabled">>,
  ) {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/users/whatsapp/numbers/${id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        setMessage({
          type: "error",
          text: await readError(res, "Gagal memperbarui nomor."),
        });
        return;
      }
      setEditingId(null);
      await fetchStatus();
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  async function setPrimary(id: string) {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_BASE}/users/whatsapp/numbers/${id}/primary`,
        { method: "POST", headers: authHeaders() },
      );
      if (!res.ok) {
        setMessage({
          type: "error",
          text: await readError(res, "Gagal mengubah nomor utama."),
        });
        return;
      }
      setMessage({ type: "success", text: "Nomor utama diperbarui." });
      await fetchStatus();
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  async function unlinkNumber() {
    if (!unlinkTarget || !unlinkPassword) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_BASE}/users/whatsapp/numbers/${unlinkTarget.id}`,
        {
          method: "DELETE",
          headers: authHeaders(true),
          body: JSON.stringify({ password: unlinkPassword }),
        },
      );
      if (!res.ok && res.status !== 204) {
        setMessage({
          type: "error",
          text: await readError(res, "Gagal melepaskan nomor."),
        });
        return;
      }
      setMessage({ type: "success", text: "Nomor WhatsApp dilepaskan." });
      setUnlinkTarget(null);
      setUnlinkPassword("");
      await fetchStatus();
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePref(key: keyof NotificationPrefs) {
    if (!prefs) return;
    setUpdatingPref(key);
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      const res = await fetch(`${API_BASE}/users/notifications`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (res.ok) setPrefs(await res.json());
      else setPrefs(previous);
    } catch {
      setPrefs(previous);
    } finally {
      setUpdatingPref(null);
    }
  }

  const numbers = status?.numbers ?? [];
  const canAdd = numbers.length < (status?.limit ?? 3);
  const chatUsage = quota?.usage.find(
    (item) => item.key === "whatsapp.chat_actions",
  );
  const voiceUsage = quota?.usage.find(
    (item) => item.key === "whatsapp.voice_seconds",
  );
  const proactiveUsage = quota?.usage.find(
    (item) => item.key === "whatsapp.proactive_deliveries",
  );
  const usagePercent = (usage?: MembershipUsage) =>
    usage?.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2 sm:py-4">
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-600/10 text-emerald-600 shadow-sm dark:text-emerald-400">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
        </div>
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Chat jadi catatan
          </p>
          <h1 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
            WhatsApp Bot
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola nomor, membership, dan kuota WhatsApp akunmu.
          </p>
        </div>
      </div>

      {quota && (
        <div className="mf-card space-y-5 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Gauge className="h-4 w-4" /> Membership
              </p>
              <h2 className="mt-1 text-xl font-bold">Plan {quota.plan.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Reset{" "}
                {new Date(quota.resetAt).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                  timeZone: "Asia/Jakarta",
                })}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {quota.status.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Chat action",
                usage: chatUsage,
                format: (value: number) => value.toLocaleString("id-ID"),
              },
              {
                label: "Voice note",
                usage: voiceUsage,
                format: (value: number) => `${Math.floor(value / 60)} menit`,
              },
              {
                label: "Pesan proaktif berbayar",
                usage: proactiveUsage,
                format: (value: number) => value.toLocaleString("id-ID"),
              },
            ].map(({ label, usage, format }) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {format(usage?.used ?? 0)} / {format(usage?.limit ?? 0)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${usagePercent(usage) >= 90 ? "bg-destructive" : usagePercent(usage) >= 70 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${usagePercent(usage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {quota.plan.code === "free" && (
            <p className="flex gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
              Pesan proaktif di luar window gratis dan nomor tambahan terkunci
              pada plan Free.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            {quota.pricingNotice}
          </p>
        </div>
      )}

      <div className="mf-card rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Nomor terhubung</h2>
            <p className="text-xs text-muted-foreground">
              {numbers.length}/{status?.limit ?? 3} slot digunakan
            </p>
          </div>
          <FlowBuddy size="sm" />
        </div>
        <p className="mb-4 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          Semua nomor aktif memiliki akses bot dan data finansial akun yang
          sama. Lepaskan segera nomor yang hilang atau sudah tidak digunakan.
        </p>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Memuat status...
          </p>
        ) : numbers.length ? (
          <div className="space-y-3">
            {numbers.map((number) => (
              <div
                key={number.id}
                className="rounded-2xl border border-border/80 bg-muted/25 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{number.label}</p>
                      {number.isPrimary && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          <Star className="h-3 w-3" /> Utama
                        </span>
                      )}
                      {number.state === "restricted" && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          Dibatasi plan
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">
                      {number.phone}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Terhubung{" "}
                      {new Date(number.linkedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <ShieldCheck
                    className={`h-5 w-5 shrink-0 ${number.state === "restricted" ? "text-amber-500" : "text-emerald-500"}`}
                  />
                </div>

                {editingId === number.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={editingLabel}
                      maxLength={30}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      aria-label="Label nomor WhatsApp"
                    />
                    <button
                      type="button"
                      disabled={submitting || !editingLabel.trim()}
                      onClick={() =>
                        void updateNumber(number.id, {
                          label: editingLabel.trim(),
                        })
                      }
                      className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      Simpan
                    </button>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {!number.isPrimary && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void setPrimary(number.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                    >
                      Jadikan utama
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setEditingId(number.id);
                      setEditingLabel(number.label);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                  >
                    <Pencil className="h-3 w-3" /> Ubah label
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={number.notificationsEnabled}
                    disabled={
                      submitting ||
                      number.isPrimary ||
                      number.state === "restricted"
                    }
                    onClick={() =>
                      void updateNumber(number.id, {
                        notificationsEnabled: !number.notificationsEnabled,
                      })
                    }
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Notifikasi:{" "}
                    {number.isPrimary
                      ? "Default"
                      : number.notificationsEnabled
                        ? "Aktif"
                        : "Mati"}
                  </button>
                  <button
                    type="button"
                    disabled={
                      submitting || (number.isPrimary && numbers.length > 1)
                    }
                    title={
                      number.isPrimary && numbers.length > 1
                        ? "Jadikan nomor lain sebagai utama terlebih dahulu"
                        : undefined
                    }
                    onClick={() => {
                      setUnlinkTarget(number);
                      setUnlinkPassword("");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Unlink className="h-3 w-3" /> Lepaskan
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            Belum ada nomor terhubung. Tambahkan nomor pertamamu di bawah.
          </p>
        )}
      </div>

      {!loading && (
        <div className="mf-card space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Tambah nomor</h2>
          </div>
          {canAdd ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={newLabel}
                  maxLength={30}
                  onChange={(event) => setNewLabel(event.target.value)}
                  placeholder={
                    numbers.length === 0
                      ? "Label, mis. Pribadi"
                      : "Label, mis. Kerja"
                  }
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                  aria-label="Label nomor baru"
                />
                <button
                  type="button"
                  onClick={() => void handleLink()}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  <Link className="h-4 w-4" />
                  {submitting ? "Membuat link..." : "Buat link"}
                </button>
              </div>

              {linkChallenge && (
                <div className="space-y-3 rounded-2xl border border-primary/15 bg-primary/[0.045] p-4">
                  <p className="text-xs text-muted-foreground">
                    Link untuk <strong>{linkChallenge.label}</strong> berlaku
                    sampai{" "}
                    {new Date(linkChallenge.expiresAt).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                    . Buka WhatsApp dari nomor yang ingin ditambahkan.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={linkChallenge.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <ExternalLink className="h-4 w-4" /> Buka WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => void fetchStatus()}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                    >
                      <RefreshCw className="h-4 w-4" /> Cek status
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-brand-lime/60 bg-brand-lime/10 p-4">
              <div className="flex gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-kicker" />
                <div>
                  <p className="font-semibold">
                    Slot nomor pada plan {quota?.plan.name ?? "saat ini"} sudah
                    penuh
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lihat plan yang mendukung {numbers.length + 1} nomor
                    WhatsApp. Pembayaran masih dinonaktifkan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/settings/membership?source=whatsapp-number-limit&required=${numbers.length + 1}`,
                  )
                }
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-lime px-4 text-sm font-bold text-brand-navy"
              >
                Lihat Membership
              </button>
            </div>
          )}
        </div>
      )}

      {status?.linked && prefs && (
        <div className="mf-card space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Jenis notifikasi WhatsApp</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Nomor utama selalu menjadi tujuan default. Nomor tambahan menerima
            notifikasi hanya jika toggle pada kartunya diaktifkan.
          </p>
          {numbers.filter(
            (number) => number.isPrimary || number.notificationsEnabled,
          ).length > 1 && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              Notifikasi aktif di lebih dari satu nomor. Setiap tujuan dapat
              menambah volume dan biaya pesan WhatsApp.
            </p>
          )}
          <div className="space-y-3">
            {PREF_LABELS.map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-xl p-2 hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <span className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={prefs[key]}
                    className="peer sr-only"
                    checked={prefs[key]}
                    disabled={updatingPref === key}
                    onChange={() => void togglePref(key)}
                  />
                  <span
                    aria-hidden
                    className="block h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-brand-lime peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 peer-disabled:opacity-50"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full border border-black/10 bg-white shadow-sm transition-transform peer-checked:translate-x-5"
                  />
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {unlinkTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlink-whatsapp-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div>
              <h2 id="unlink-whatsapp-title" className="font-semibold">
                Lepaskan {unlinkTarget.label}?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Akses bot dari {unlinkTarget.phone} akan langsung dicabut.
                Masukkan password akun untuk melanjutkan.
              </p>
            </div>
            <input
              type="password"
              autoFocus
              value={unlinkPassword}
              onChange={(event) => setUnlinkPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setUnlinkTarget(null);
                if (event.key === "Enter") void unlinkNumber();
              }}
              placeholder="Password akun"
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setUnlinkTarget(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting || !unlinkPassword}
                onClick={() => void unlinkNumber()}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
              >
                {submitting ? "Melepaskan..." : "Lepaskan nomor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
