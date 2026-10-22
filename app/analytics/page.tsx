"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendChart } from "@/components/analytics/TrendChart";
import { CategorySpendingList } from "@/components/analytics/CategorySpendingList";
import { InsightCard } from "@/components/analytics/InsightCard";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { useTransactions } from "@/hooks/useTransactions";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCurrency } from "@/hooks/useCurrency";
import { useLedgerCurrency } from "@/hooks/useLedgerCurrency";
import type { Transaction } from "@/lib/types";
import { analyticsApi, type ApiAnalyticsPeriod } from "@/lib/api";
import { useAccountStore } from "@/store/accountStore";

const RANGES = [
  { label: "30 hari terakhir", period: "1m", months: 1 },
  { label: "3 bulan terakhir", period: "3m", months: 3 },
  { label: "6 bulan terakhir", period: "6m", months: 6 },
  { label: "12 bulan terakhir", period: "12m", months: 12 },
] as const;

export default function AnalyticsPage() {
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState<ApiAnalyticsPeriod["period"]>("6m");
  const months = RANGES.find((range) => range.period === period)?.months ?? 6;
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const [serverAnalytics, setServerAnalytics] =
    useState<ApiAnalyticsPeriod | null>(null);
  const { fmt } = useCurrency();
  const ledgerCurrency = useLedgerCurrency();
  // Analitik di-scope ke pocket aktif, jadi semua nominal memakai currency
  // ledger pocket tersebut sebagai sumber konversi.
  const money = (value: number) => fmt(value, { from: ledgerCurrency });

  const cutoff = useMemo(() => {
    const d = new Date();
    if (period === "1m") {
      d.setDate(d.getDate() - 29);
      return d.toISOString().slice(0, 10);
    }
    d.setDate(1);
    d.setMonth(d.getMonth() - (months - 1));
    return d.toISOString().slice(0, 10);
  }, [months, period]);

  const inRange: Transaction[] = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.date >= cutoff &&
          (!activeAccountId || tx.accountId === activeAccountId),
      ),
    [transactions, cutoff, activeAccountId],
  );

  const clientAnalytics = useAnalytics({
    transactions: inRange,
    months,
  });
  useEffect(() => {
    analyticsApi
      .get(period, activeAccountId ?? undefined)
      .then(setServerAnalytics)
      .catch(() => setServerAnalytics(null));
  }, [period, activeAccountId]);
  const summary = serverAnalytics
    ? {
        totalBalance: serverAnalytics.summary.net,
        totalIncome: serverAnalytics.summary.totalIncome,
        totalExpense: serverAnalytics.summary.totalExpense,
        transactionCount: serverAnalytics.summary.transactionCount,
      }
    : clientAnalytics.summary;
  const monthly = serverAnalytics
    ? serverAnalytics.buckets.map((bucket) => ({
        month:
          serverAnalytics.granularity === "day"
            ? bucket.key.slice(5)
            : bucket.key,
        income: bucket.income,
        expense: bucket.expense,
        net: bucket.net,
      }))
    : clientAnalytics.monthly;
  const { expenseByCategory, momChange } = clientAnalytics;
  const periodChange = serverAnalytics
    ? {
        delta: serverAnalytics.summary.net - serverAnalytics.comparison.net,
        pct:
          serverAnalytics.comparison.net === 0
            ? null
            : ((serverAnalytics.summary.net - serverAnalytics.comparison.net) /
                Math.abs(serverAnalytics.comparison.net)) *
              100,
      }
    : momChange;

  const topCategory = expenseByCategory[0];

  // TAG-04: aggregate expense amount by tag
  const expenseByTag = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of inRange) {
      if (tx.type !== "expense") continue;
      for (const tag of tx.tags ?? []) {
        map.set(tag, (map.get(tag) ?? 0) + tx.amount);
      }
    }
    return Array.from(map.entries())
      .map(([tag, total]) => ({ tag, total }))
      .sort((a, b) => b.total - a.total);
  }, [inRange]);

  const momTone =
    periodChange === null
      ? "neutral"
      : periodChange.delta >= 0
        ? "positive"
        : "negative";
  const momIcon =
    momTone === "positive" ? (
      <TrendingUp className="h-4 w-4" />
    ) : momTone === "negative" ? (
      <TrendingDown className="h-4 w-4" />
    ) : (
      <Wallet className="h-4 w-4" />
    );

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-kicker">
            <Sparkles className="h-3.5 w-3.5" /> Cerita di balik angka
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
            Analitik
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lihat pengeluaran yang paling sering membuat uang pergi tanpa
            terasa.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="range">Periode</Label>
          <Select
            id="range"
            value={period}
            onValueChange={(range) =>
              setPeriod(range as ApiAnalyticsPeriod["period"])
            }
            options={RANGES.map((range) => ({
              value: range.period,
              label: range.label,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Saldo bersih"
          value={money(summary.totalBalance)}
          tone={summary.totalBalance >= 0 ? "positive" : "negative"}
          icon={<Wallet className="h-4 w-4" />}
        />
        <InsightCard
          label="Pemasukan"
          value={money(summary.totalIncome)}
          tone="positive"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <InsightCard
          label="Pengeluaran"
          value={money(summary.totalExpense)}
          tone="negative"
          icon={<ArrowDownLeft className="h-4 w-4" />}
        />
        <InsightCard
          label="Periode ini vs sebelumnya"
          value={
            periodChange === null
              ? "—"
              : `${periodChange.delta >= 0 ? "+" : ""}${money(periodChange.delta)}`
          }
          delta={
            periodChange === null
              ? undefined
              : periodChange.pct === null
                ? "vs periode sebelumnya"
                : `${periodChange.pct >= 0 ? "+" : ""}${periodChange.pct.toFixed(1)}% vs periode sebelumnya`
          }
          tone={momTone}
          icon={momIcon}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-kicker">
            Arus kas
          </p>
          <CardTitle>Tren pemasukan & pengeluaran</CardTitle>
          <p className="text-sm text-muted-foreground">
            Lihat kapan uang datang dan ke mana paling banyak pergi.
          </p>
        </CardHeader>
        <CardContent>
          <TrendChart data={monthly} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Perbandingan bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceChart data={monthly} />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Kategori pengeluaran terbesar</CardTitle>
            {topCategory ? (
              <p className="text-sm text-muted-foreground">
                Tertinggi:{" "}
                <span className="font-medium text-foreground">
                  {topCategory.categoryName}
                </span>{" "}
                sebesar {money(topCategory.total)}
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            <CategorySpendingList data={expenseByCategory.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>
      {expenseByTag.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Pengeluaran per tag</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown pengeluaran berdasarkan tag transaksi.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseByTag.slice(0, 8).map(({ tag, total }) => {
                const max = expenseByTag[0].total;
                const pct = max > 0 ? (total / max) * 100 : 0;
                return (
                  <div key={tag} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">
                        {tag}
                      </span>
                      <span>{money(total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
