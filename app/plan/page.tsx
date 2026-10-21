"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CalendarDays,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ApiError,
  type ApiForecast,
  type ApiGoal,
  type ApiTrackedSubscription,
  type SubscriptionCandidate,
  forecastApi,
  goalsApi,
  membershipApi,
  planningAssistantApi,
  trackedSubscriptionsApi,
} from "@/lib/api";
import { todayISO } from "@/lib/utils";
import { useAccountStore } from "@/store/accountStore";
import { useCategoryStore } from "@/store/categoryStore";

const money = (value: number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const GOAL_TEMPLATES = {
  custom: { label: "Custom", name: "", icon: "Target" },
  emergency: {
    label: "Dana darurat",
    name: "Dana darurat",
    icon: "ShieldCheck",
  },
  holiday: { label: "Liburan", name: "Liburan", icon: "Plane" },
  education: { label: "Pendidikan", name: "Pendidikan", icon: "GraduationCap" },
  gadget: { label: "Gadget", name: "Gadget", icon: "Smartphone" },
} as const;
type GoalTemplateCode = keyof typeof GOAL_TEMPLATES;

export default function PlanPage() {
  const accounts = useAccountStore((state) => state.accounts).filter(
    (account) => !account.archivedAt,
  );
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const categories = useCategoryStore((state) => state.categories).filter(
    (category) => !category.archivedAt && !category.readOnly,
  );
  const [goals, setGoals] = useState<ApiGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<ApiTrackedSubscription[]>(
    [],
  );
  const [candidates, setCandidates] = useState<SubscriptionCandidate[]>([]);
  const [forecast, setForecast] = useState<ApiForecast | null>(null);
  const [forecastAccountId, setForecastAccountId] = useState(
    activeAccountId ?? "",
  );
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [scenario, setScenario] = useState({
    startingBalanceDelta: "",
    dailyIncomeDelta: "",
    dailyExpenseDelta: "",
  });
  const [horizon, setHorizon] = useState<30 | 60 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assistantAvailable, setAssistantAvailable] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantConsent, setAssistantConsent] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState<{
    answer: string;
    disclosure: string;
  } | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [goalForm, setGoalForm] = useState({
    template: "custom" as GoalTemplateCode,
    name: "",
    targetAmount: "",
    targetDate: "",
    accountId: "",
    priority: "0",
    reminderEnabled: false,
  });
  const [subscriptionForm, setSubscriptionForm] = useState({
    merchant: "",
    amount: "",
    nextChargeAt: "",
    frequency: "monthly" as ApiTrackedSubscription["frequency"],
    accountId: "",
    categoryId: "",
    reminderEnabled: false,
    reminderLeadDays: "3",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextGoals, nextSubscriptions, nextForecast] = await Promise.all([
        goalsApi.list(),
        trackedSubscriptionsApi.list(),
        forecastApi.get(
          horizon,
          forecastAccountId || undefined,
          scenarioId ?? undefined,
        ),
      ]);
      setGoals(nextGoals);
      setSubscriptions(nextSubscriptions);
      setForecast(nextForecast);
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Area Plan gagal dimuat",
      );
    } finally {
      setLoading(false);
    }
  }, [forecastAccountId, horizon, scenarioId]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void membershipApi
      .entitlements()
      .then((snapshot) =>
        setAssistantAvailable(
          (snapshot.entitlements["ai.assistant"]?.limit ?? 0) > 0 ||
            snapshot.entitlements["ai.assistant"]?.unlimited === true,
        ),
      )
      .catch(() => setAssistantAvailable(false));
  }, []);
  useEffect(() => {
    if (activeAccountId) {
      setSubscriptionForm((current) => ({
        ...current,
        accountId: current.accountId || activeAccountId,
      }));
    }
  }, [activeAccountId]);

  const upcoming = useMemo(
    () => subscriptions.filter((item) => item.status === "active").slice(0, 5),
    [subscriptions],
  );
  const subscriptionTotals = useMemo(
    () =>
      subscriptions
        .filter((item) => item.status === "active")
        .reduce(
          (total, item) => ({
            monthly: total.monthly + (item.monthlyCost ?? 0),
            annual: total.annual + (item.annualCost ?? 0),
          }),
          { monthly: 0, annual: 0 },
        ),
    [subscriptions],
  );

  const createGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await goalsApi.create({
        name: goalForm.name,
        targetAmount: Number(goalForm.targetAmount),
        targetDate: goalForm.targetDate || undefined,
        currency:
          accounts.find((account) => account.id === goalForm.accountId)
            ?.currency ?? "IDR",
        accountId: goalForm.accountId || undefined,
        icon: GOAL_TEMPLATES[goalForm.template].icon,
        priority: Number(goalForm.priority),
        reminderEnabled: goalForm.reminderEnabled,
      });
      setGoalForm((current) => ({
        ...current,
        template: "custom",
        name: "",
        targetAmount: "",
        targetDate: "",
        priority: "0",
        reminderEnabled: false,
      }));
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Goal gagal disimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateGoalStatus = async (goal: ApiGoal, status: ApiGoal["status"]) => {
    setSaving(true);
    setError("");
    try {
      await goalsApi.update(goal.id, { status });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Status goal gagal diubah",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateSubscriptionStatus = async (
    subscription: ApiTrackedSubscription,
    status: ApiTrackedSubscription["status"],
  ) => {
    setSaving(true);
    setError("");
    try {
      await trackedSubscriptionsApi.update(subscription.id, { status });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Status subscription gagal diubah",
      );
    } finally {
      setSaving(false);
    }
  };

  const askAssistant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assistantQuestion.trim() || !assistantConsent) return;
    setAssistantLoading(true);
    setAssistantError("");
    try {
      const result = await planningAssistantApi.ask(
        assistantQuestion.trim(),
        assistantConsent,
      );
      setAssistantAnswer(result);
    } catch (reason) {
      setAssistantError(
        reason instanceof ApiError
          ? reason.message
          : "AI Assistant sedang tidak tersedia",
      );
    } finally {
      setAssistantLoading(false);
    }
  };

  const contribute = async (goal: ApiGoal) => {
    const raw = window.prompt(`Kontribusi untuk ${goal.name}`);
    if (!raw || Number(raw) <= 0) return;
    let sourceAccountId: string | undefined;
    if (goal.accountId) {
      const destination = accounts.find(
        (account) => account.id === goal.accountId,
      );
      const sources = accounts.filter(
        (account) =>
          account.ownership === "owned" &&
          !account.readOnly &&
          account.id !== goal.accountId &&
          account.currency === goal.currency,
      );
      const fallback =
        sources.find((account) => account.id === activeAccountId) ?? sources[0];
      if (!fallback) {
        setError(
          "Kontribusi goal pocket memerlukan pocket sumber lain dengan currency yang sama.",
        );
        return;
      }
      const sourceName = window.prompt(
        `Pocket sumber (tujuan: ${destination?.name ?? "pocket goal"})\nPilihan: ${sources.map((account) => account.name).join(", ")}`,
        fallback.name,
      );
      const selected = sources.find(
        (account) =>
          account.name.toLowerCase() === sourceName?.trim().toLowerCase(),
      );
      if (!selected) return;
      sourceAccountId = selected.id;
    }
    if (
      !window.confirm(
        `Konfirmasi kontribusi ${money(Number(raw), goal.currency)} ke ${goal.name}?`,
      )
    )
      return;
    setSaving(true);
    try {
      await goalsApi.contribute(goal.id, {
        amount: Number(raw),
        kind: "add",
        date: todayISO(),
        idempotencyKey: crypto.randomUUID(),
        sourceAccountId,
      });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Kontribusi gagal disimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const applyScenario = async () => {
    setSaving(true);
    setError("");
    try {
      if (scenarioId) await forecastApi.deleteScenario(scenarioId);
      const created = await forecastApi.createScenario({
        horizon,
        accountId: forecastAccountId || undefined,
        overrides: Object.fromEntries(
          Object.entries(scenario)
            .filter(([, value]) => value.trim() !== "")
            .map(([key, value]) => [key, Number(value)]),
        ),
      });
      setScenarioId(created.id);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Skenario gagal diterapkan",
      );
    } finally {
      setSaving(false);
    }
  };

  const clearScenario = async () => {
    if (scenarioId) await forecastApi.deleteScenario(scenarioId);
    setScenarioId(null);
    setScenario({
      startingBalanceDelta: "",
      dailyIncomeDelta: "",
      dailyExpenseDelta: "",
    });
  };

  const createSubscription = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await trackedSubscriptionsApi.create({
        merchant: subscriptionForm.merchant,
        amount: Number(subscriptionForm.amount),
        currency:
          accounts.find((account) => account.id === subscriptionForm.accountId)
            ?.currency ?? "IDR",
        frequency: subscriptionForm.frequency,
        intervalDays: subscriptionForm.frequency === "custom" ? 30 : null,
        nextChargeAt: subscriptionForm.nextChargeAt,
        accountId: subscriptionForm.accountId,
        categoryId: subscriptionForm.categoryId || null,
        reminderEnabled: subscriptionForm.reminderEnabled,
        reminderLeadDays: Number(subscriptionForm.reminderLeadDays),
      });
      setSubscriptionForm((current) => ({
        ...current,
        merchant: "",
        amount: "",
        nextChargeAt: "",
        reminderEnabled: false,
        reminderLeadDays: "3",
      }));
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Subscription gagal disimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const detect = async () => {
    setSaving(true);
    try {
      setCandidates(await trackedSubscriptionsApi.detect());
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Deteksi pola gagal",
      );
    } finally {
      setSaving(false);
    }
  };

  const acceptCandidate = async (candidate: SubscriptionCandidate) => {
    setSaving(true);
    try {
      await trackedSubscriptionsApi.create({
        merchant: candidate.merchant,
        amount: candidate.amount,
        currency: candidate.currency,
        frequency: candidate.frequency,
        intervalDays: candidate.intervalDays,
        nextChargeAt: candidate.nextChargeAt,
        accountId: candidate.accountId,
        categoryId: candidate.categoryId,
        reminderEnabled: false,
        reminderLeadDays: 3,
      });
      setCandidates((current) =>
        current.filter((item) => item.merchant !== candidate.merchant),
      );
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-kicker">
            Rencanakan
          </p>
          <h2 className="text-3xl font-black">Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Goal, forecast, dan biaya rutin dalam satu tempat.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" /> Segarkan
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> AI Assistant
            <span className="rounded-full bg-brand-lime/20 px-2 py-0.5 text-[10px] font-black uppercase">
              Pro
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assistantAvailable ? (
            <form onSubmit={askAssistant} className="space-y-3">
              <textarea
                value={assistantQuestion}
                onChange={(event) => setAssistantQuestion(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Contoh: apa risiko terbesar dalam rencana 30 hari saya?"
                className="w-full resize-y rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={assistantConsent}
                  onChange={(event) =>
                    setAssistantConsent(event.target.checked)
                  }
                  className="mt-0.5"
                />
                Saya setuju ringkasan goal, forecast, subscription, dan net
                worth diproses penyedia AI untuk menjawab pertanyaan ini.
              </label>
              <Button
                type="submit"
                disabled={
                  assistantLoading ||
                  !assistantConsent ||
                  !assistantQuestion.trim()
                }
              >
                {assistantLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                Tanyakan
              </Button>
              {assistantError ? (
                <p role="alert" className="text-sm text-destructive">
                  {assistantError}
                </p>
              ) : null}
              {assistantAnswer ? (
                <div className="rounded-xl border bg-muted/35 p-4">
                  <p className="whitespace-pre-wrap text-sm">
                    {assistantAnswer.answer}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {assistantAnswer.disclosure}
                  </p>
                </div>
              ) : null}
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              AI Assistant tersedia di plan Pro. Goal, forecast, subscription,
              dan net worth deterministik tetap dapat digunakan.{" "}
              <Link
                href="/settings/membership"
                className="font-semibold text-foreground underline"
              >
                Lihat Membership
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Cashflow forecast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {([30, 60, 90] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={horizon === value ? "default" : "outline"}
                  onClick={() => setHorizon(value)}
                >
                  {value} hari
                </Button>
              ))}
              <select
                aria-label="Pocket forecast"
                className="h-9 max-w-full rounded-md border bg-background px-3 text-sm"
                value={forecastAccountId}
                onChange={(event) => {
                  setForecastAccountId(event.target.value);
                  setScenarioId(null);
                }}
              >
                <option value="">Gabungan pocket</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : forecast ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Saldo akhir"
                    value={money(forecast.endingBalance, forecast.currency)}
                  />
                  <Metric
                    label="Saldo terendah"
                    value={money(forecast.lowestBalance, forecast.currency)}
                    danger={forecast.negativeRisk}
                  />
                  <Metric
                    label="Kualitas data"
                    value={`${forecast.dataQuality.level} · ${forecast.dataQuality.transactionCount} transaksi`}
                  />
                </div>
                <div
                  className="flex h-36 items-end gap-1 overflow-hidden rounded-xl bg-muted/45 p-3"
                  aria-label="Proyeksi saldo harian"
                >
                  {forecast.points.map((point) => {
                    const max = Math.max(
                      ...forecast.points.map((row) => Math.abs(row.balance)),
                      1,
                    );
                    return (
                      <span
                        key={point.date}
                        title={`${point.date}: ${money(point.balance, forecast.currency)}`}
                        className={`min-w-1 flex-1 rounded-t ${point.balance < 0 ? "bg-destructive" : "bg-brand-lime"}`}
                        style={{
                          height: `${Math.max(5, (Math.abs(point.balance) / max) * 100)}%`,
                        }}
                      />
                    );
                  })}
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {forecast.assumptions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Skenario what-if
                  </summary>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <Input
                      inputMode="decimal"
                      placeholder="Perubahan saldo awal"
                      value={scenario.startingBalanceDelta}
                      onChange={(event) =>
                        setScenario({
                          ...scenario,
                          startingBalanceDelta: event.target.value,
                        })
                      }
                    />
                    <Input
                      inputMode="decimal"
                      placeholder="Pemasukan / hari"
                      value={scenario.dailyIncomeDelta}
                      onChange={(event) =>
                        setScenario({
                          ...scenario,
                          dailyIncomeDelta: event.target.value,
                        })
                      }
                    />
                    <Input
                      inputMode="decimal"
                      placeholder="Pengeluaran / hari"
                      value={scenario.dailyExpenseDelta}
                      onChange={(event) =>
                        setScenario({
                          ...scenario,
                          dailyExpenseDelta: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void applyScenario()}
                      disabled={saving}
                    >
                      Terapkan
                    </Button>
                    {scenarioId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void clearScenario()}
                      >
                        Hapus skenario
                      </Button>
                    ) : null}
                  </div>
                </details>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription mendatang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Metric
                label="Per bulan"
                value={money(subscriptionTotals.monthly)}
              />
              <Metric
                label="Per tahun"
                value={money(subscriptionTotals.annual)}
              />
            </div>
            {upcoming.length ? (
              upcoming.map((item) => (
                <div key={item.id} className="rounded-xl border p-3">
                  <p className="font-semibold">{item.merchant}</p>
                  <p className="text-sm">{money(item.amount, item.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.nextChargeAt} · {item.frequency}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada biaya rutin.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={createGoal} className="grid gap-2 sm:grid-cols-2">
              <select
                aria-label="Template goal"
                className="h-10 rounded-md border bg-background px-3 text-sm sm:col-span-2"
                value={goalForm.template}
                onChange={(event) => {
                  const template = event.target.value as GoalTemplateCode;
                  setGoalForm({
                    ...goalForm,
                    template,
                    name: GOAL_TEMPLATES[template].name,
                  });
                }}
              >
                {Object.entries(GOAL_TEMPLATES).map(([code, template]) => (
                  <option key={code} value={code}>
                    Template: {template.label}
                  </option>
                ))}
              </select>
              <Input
                required
                placeholder="Nama goal"
                value={goalForm.name}
                onChange={(event) =>
                  setGoalForm({ ...goalForm, name: event.target.value })
                }
              />
              <Input
                required
                inputMode="numeric"
                placeholder="Target nominal"
                value={goalForm.targetAmount}
                onChange={(event) =>
                  setGoalForm({ ...goalForm, targetAmount: event.target.value })
                }
              />
              <Input
                type="date"
                value={goalForm.targetDate}
                onChange={(event) =>
                  setGoalForm({ ...goalForm, targetDate: event.target.value })
                }
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={goalForm.accountId}
                onChange={(event) =>
                  setGoalForm({ ...goalForm, accountId: event.target.value })
                }
              >
                <option value="">Pocket virtual</option>
                {accounts
                  .filter(
                    (account) =>
                      account.ownership === "owned" && !account.readOnly,
                  )
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
              <select
                aria-label="Prioritas goal"
                className="h-10 rounded-md border bg-background px-3 text-sm sm:col-span-2"
                value={goalForm.priority}
                onChange={(event) =>
                  setGoalForm({ ...goalForm, priority: event.target.value })
                }
              >
                <option value="0">Prioritas normal</option>
                <option value="50">Prioritas tinggi</option>
                <option value="100">Prioritas utama</option>
              </select>
              <label className="flex min-h-10 items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={goalForm.reminderEnabled}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      reminderEnabled: event.target.checked,
                    })
                  }
                />
                Ingatkan bila goal tertinggal (opt-in)
              </label>
              <Button disabled={saving} className="sm:col-span-2">
                <Plus className="h-4 w-4" /> Buat goal
              </Button>
            </form>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.targetDate
                          ? `Target ${goal.targetDate}`
                          : "Tanpa tenggat"}{" "}
                        · {goal.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <select
                        aria-label={`Status ${goal.name}`}
                        className="h-9 rounded-md border bg-background px-2 text-xs"
                        value={goal.status}
                        disabled={saving}
                        onChange={(event) =>
                          void updateGoalStatus(
                            goal,
                            event.target.value as ApiGoal["status"],
                          )
                        }
                      >
                        <option value="active">Aktif</option>
                        <option value="paused">Dijeda</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => void contribute(goal)}
                        disabled={saving || goal.status === "cancelled"}
                      >
                        Kontribusi
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-lime"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span>{money(goal.progress, goal.currency)}</span>
                    <span>
                      {goal.percentage}% dari{" "}
                      {money(goal.targetAmount, goal.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={createSubscription}
              className="grid gap-2 sm:grid-cols-2"
            >
              <Input
                required
                placeholder="Merchant"
                value={subscriptionForm.merchant}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    merchant: event.target.value,
                  })
                }
              />
              <Input
                required
                inputMode="numeric"
                placeholder="Nominal"
                value={subscriptionForm.amount}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    amount: event.target.value,
                  })
                }
              />
              <Input
                required
                type="date"
                value={subscriptionForm.nextChargeAt}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    nextChargeAt: event.target.value,
                  })
                }
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={subscriptionForm.frequency}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    frequency: event.target
                      .value as ApiTrackedSubscription["frequency"],
                  })
                }
              >
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
                <option value="custom">Custom 30 hari</option>
              </select>
              <select
                required
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={subscriptionForm.accountId}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    accountId: event.target.value,
                  })
                }
              >
                <option value="">Pilih pocket</option>
                {accounts
                  .filter(
                    (account) => !account.readOnly && account.role !== "viewer",
                  )
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={subscriptionForm.categoryId}
                onChange={(event) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    categoryId: event.target.value,
                  })
                }
              >
                <option value="">Tanpa kategori</option>
                {categories
                  .filter((category) => category.type !== "income")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <label className="flex min-h-10 items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={subscriptionForm.reminderEnabled}
                  onChange={(event) =>
                    setSubscriptionForm({
                      ...subscriptionForm,
                      reminderEnabled: event.target.checked,
                    })
                  }
                />
                Ingatkan sebelum tagihan (opt-in)
              </label>
              {subscriptionForm.reminderEnabled ? (
                <label className="grid gap-1 text-sm sm:col-span-2">
                  Ingatkan berapa hari sebelumnya
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={subscriptionForm.reminderLeadDays}
                    onChange={(event) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        reminderLeadDays: event.target.value,
                      })
                    }
                  />
                </label>
              ) : null}
              <Button disabled={saving} className="sm:col-span-2">
                <CalendarDays className="h-4 w-4" /> Simpan subscription
              </Button>
            </form>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void detect()}
              disabled={saving}
            >
              <WalletCards className="h-4 w-4" /> Deteksi dari histori
            </Button>
            {candidates.map((candidate) => (
              <div
                key={candidate.merchant}
                className="flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="font-semibold">{candidate.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {candidate.occurrences}× ·{" "}
                    {money(candidate.amount, candidate.currency)}
                    {candidate.possiblePriceIncrease
                      ? " · kemungkinan naik"
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => void acceptCandidate(candidate)}
                >
                  Konfirmasi
                </Button>
              </div>
            ))}
            {subscriptions.length ? (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Subscription tersimpan
                </p>
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-semibold">{subscription.merchant}</p>
                      <p className="text-xs text-muted-foreground">
                        {money(subscription.amount, subscription.currency)} ·{" "}
                        {subscription.nextChargeAt}
                      </p>
                    </div>
                    <select
                      aria-label={`Status ${subscription.merchant}`}
                      className="h-9 rounded-md border bg-background px-2 text-xs"
                      value={subscription.status}
                      disabled={saving}
                      onChange={(event) =>
                        void updateSubscriptionStatus(
                          subscription,
                          event.target
                            .value as ApiTrackedSubscription["status"],
                        )
                      }
                    >
                      <option value="active">Aktif</option>
                      <option value="paused">Dijeda</option>
                      <option value="cancelled">Dibatalkan (tracking)</option>
                    </select>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Membatalkan tracking tidak membatalkan layanan di merchant.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      {!loading && !goals.length && !subscriptions.length ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-semibold">Mulai dari satu rencana kecil.</p>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Forecast adalah proyeksi berdasarkan data saat ini, bukan kepastian atau
        nasihat investasi.
      </p>
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
    <div className="rounded-xl bg-muted/55 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-bold ${danger ? "text-destructive" : ""}`}>
        {value}
      </p>
    </div>
  );
}
