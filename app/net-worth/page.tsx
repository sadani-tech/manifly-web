"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Landmark, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError, type ApiNetWorth, netWorthApi } from "@/lib/api";
import { todayISO } from "@/lib/utils";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import type { CurrencyCode } from "@/lib/types";

const money = (value: number, currency: string, approx = false) =>
  `${approx ? "≈ " : ""}${new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)}`;

/** "2 hari lalu" untuk mengungkap umur kurs yang dipakai konversi. */
const rateAge = (observedAt: string | null): string | null => {
  if (!observedAt) return null;
  const then = new Date(observedAt).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "1 hari lalu";
  return `${days} hari lalu`;
};

export default function NetWorthPage() {
  const [summary, setSummary] = useState<ApiNetWorth | null>(null);
  // Net worth mengagregasi seluruh pocket, jadi mata uang pelaporannya dipilih
  // user di sini (CUR-03) — tidak mengikuti pocket aktif seperti dashboard.
  const [reportCurrency, setReportCurrency] =
    useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [type, setType] = useState<"assets" | "liabilities">("assets");
  const [form, setForm] = useState({
    name: "",
    kind: "other",
    value: "",
    valuedAt: todayISO(),
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await netWorthApi.get(reportCurrency));
      setError("");
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Net worth gagal dimuat",
      );
    } finally {
      setLoading(false);
    }
  }, [reportCurrency]);
  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await netWorthApi.createItem(type, {
        name: form.name,
        kind: form.kind,
        value: Number(form.value),
        currency: reportCurrency,
        valuedAt: form.valuedAt,
        excluded: false,
        notes: form.notes || null,
      });
      setForm({
        name: "",
        kind: "other",
        value: "",
        valuedAt: todayISO(),
        notes: "",
      });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Item gagal disimpan",
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-kicker">
            Posisi finansial
          </p>
          <h2 className="text-3xl font-black">Net Worth</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aset dikurangi liability, dengan sumber yang dapat ditelusuri.
          </p>
        </div>
        <label className="text-xs text-muted-foreground">
          <span className="mb-1 block font-bold uppercase tracking-widest">
            Mata uang laporan
          </span>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
            value={reportCurrency}
            onChange={(event) =>
              setReportCurrency(event.target.value as CurrencyCode)
            }
          >
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {loading && !summary ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Total aset"
              value={money(
                summary.assets,
                summary.currency,
                summary.approximate,
              )}
            />
            <Metric
              label="Total liability"
              value={money(
                summary.liabilities,
                summary.currency,
                summary.approximate,
              )}
              danger
            />
            <Metric
              label="Net worth"
              value={money(
                summary.netWorth,
                summary.currency,
                summary.approximate,
              )}
              danger={summary.netWorth < 0}
            />
            <Metric
              label="Perubahan snapshot"
              value={money(
                summary.history.length > 1
                  ? summary.netWorth -
                      summary.history[summary.history.length - 2].netWorth
                  : 0,
                summary.currency,
                summary.approximate,
              )}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Komposisi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(summary.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-muted/55 p-3">
                  <p className="text-xs capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="font-semibold">
                    {money(value, summary.currency, summary.approximate)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Tambah valuasi manual</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "assets" ? "default" : "outline"}
                  onClick={() => setType("assets")}
                >
                  Aset
                </Button>
                <Button
                  type="button"
                  variant={type === "liabilities" ? "default" : "outline"}
                  onClick={() => setType("liabilities")}
                >
                  Liability
                </Button>
              </div>
              <Input
                required
                placeholder="Nama item"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.kind}
                onChange={(event) =>
                  setForm({ ...form, kind: event.target.value })
                }
              >
                {type === "assets" ? (
                  <>
                    <option value="liquid">Aset likuid</option>
                    <option value="investment">Investasi</option>
                    <option value="property">Properti</option>
                  </>
                ) : (
                  <>
                    <option value="credit">Kredit</option>
                    <option value="loan">Pinjaman</option>
                  </>
                )}
                <option value="other">Lainnya</option>
              </select>
              <Input
                required
                inputMode="numeric"
                placeholder="Nilai"
                value={form.value}
                onChange={(event) =>
                  setForm({ ...form, value: event.target.value })
                }
              />
              <Input
                required
                type="date"
                value={form.valuedAt}
                onChange={(event) =>
                  setForm({ ...form, valuedAt: event.target.value })
                }
              />
              <Input
                placeholder="Catatan opsional"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
              <Button className="w-full" disabled={loading}>
                <Plus className="h-4 w-4" /> Simpan{" "}
                {type === "assets" ? "aset" : "liability"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valuasi manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.items.length ? (
              summary.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${item.excluded ? "opacity-50" : ""}`}
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} · {item.kind} · valuasi {item.valuedAt}
                    </p>
                    <p className="text-sm">
                      {money(item.value, item.currency)}
                    </p>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        item.excluded
                          ? `Sertakan ${item.name}`
                          : `Kecualikan ${item.name}`
                      }
                      onClick={async () => {
                        await netWorthApi.updateItem(item.id, {
                          excluded: !item.excluded,
                        });
                        await load();
                      }}
                    >
                      {item.excluded ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${item.name}`}
                      onClick={async () => {
                        await netWorthApi.deleteItem(item.id);
                        await load();
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Landmark className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada valuasi manual.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {summary ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Snapshot {summary.date}. {summary.provenance}
            {summary.excludedCurrencies.length
              ? ` Currency yang belum digabung: ${summary.excludedCurrencies.join(", ")}.`
              : ""}
          </p>
          {summary.approximate ? (
            <ul className="space-y-0.5">
              {summary.convertedCurrencies.map((code) => {
                const used = summary.rateSnapshot[code];
                if (!used) return null;
                const age = rateAge(used.observedAt);
                return (
                  <li key={code}>
                    1 {code} ={" "}
                    {new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 4,
                    }).format(used.rate)}{" "}
                    {summary.currency}
                    {age ? ` · kurs ${age}` : ""}
                    {used.source ? ` · ${used.source}` : ""}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-2 text-xl font-black ${danger ? "text-destructive" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
