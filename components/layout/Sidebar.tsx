"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Crown,
  HandCoins,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  PiggyBank,
  Repeat,
  ScanLine,
  Settings,
  Tags,
  Users,
  UserCircle,
  WalletCards,
  WandSparkles,
  Target,
  Landmark,
  ChartNoAxesCombined,
  CircleHelp,
  MessageCircleMore,
  Bell,
  DatabaseBackup,
  type LucideIcon,
} from "lucide-react";
import { FINANCIAL_ITEMS, HELP_ITEMS, NAV_ITEMS, SETTINGS_ITEMS } from "@/lib/constants";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { FlowBuddy } from "@/components/shared/FlowBuddy";
import { BrandMark } from "@/components/shared/Logo";
import { v2Flags } from "@/lib/featureFlags";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Repeat,
  HandCoins,
  ScanLine,
  Tags,
  BarChart3,
  UserCircle,
  MessageSquare,
  HeartPulse,
  Settings,
  Users,
  WalletCards,
  WandSparkles,
  Crown,
  Target,
  Landmark,
  ChartNoAxesCombined,
  CircleHelp,
  MessageCircleMore,
  Bell,
  DatabaseBackup,
};

type SidebarSubnavItem = Readonly<{
  href: string;
  label: string;
  icon: string;
}>;

function SidebarSubnav({
  items,
  pathname,
}: {
  items: readonly SidebarSubnavItem[];
  pathname: string;
}) {
  return (
    <div className="ml-5 space-y-1 border-l border-white/15 pl-3">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors",
              active
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white",
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navigation = NAV_ITEMS.filter((item) =>
    item.href === "/financial" ? v2Flags.financialNavigation : item.href === "/help" ? v2Flags.help : true,
  );
  const financialSectionActive = pathname === "/financial" || FINANCIAL_ITEMS.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const settingsSectionActive = pathname === "/settings" || pathname.startsWith("/settings/") || pathname === "/pockets" || pathname.startsWith("/pockets/");
  const helpSectionActive = pathname === "/help" || pathname.startsWith("/help/") || pathname === "/feedback";

  return (
    <aside
      className={cn(
        "z-30 hidden overflow-hidden bg-brand-navy text-white shadow-[12px_0_38px_rgba(0,0,0,.16)] transition-all duration-300 md:fixed md:inset-y-0 md:flex md:flex-col",
        sidebarCollapsed ? "md:w-[4.5rem]" : "md:w-[17rem]",
      )}
    >
      {/* Logo */}
      <div className="flex h-[4.75rem] items-center overflow-hidden border-b border-white/12 px-4">
        <BrandMark size={40} decorative />
        {!sidebarCollapsed && (
          <div className="ml-3 flex flex-col">
            <span className="text-[15px] font-bold leading-none tracking-[-0.02em]">
              Manifly
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
              Biar uang nggak asal terbang.
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigation.map((item) => {
          const Icon = ICONS[item.icon];
          const active = item.href === "/financial"
            ? financialSectionActive
            : item.href === "/settings"
              ? settingsSectionActive
              : item.href === "/help"
                ? helpSectionActive
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Fragment key={item.href}>
              <Link
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "focus-ring group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,transform,box-shadow]",
                  sidebarCollapsed && "justify-center",
                  active
                    ? "bg-brand-lime font-bold text-brand-navy shadow-[4px_5px_0_rgba(0,0,0,.18)]"
                    : "text-white/62 hover:translate-x-1 hover:bg-white/10 hover:text-white",
                )}
              >
                {Icon ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-brand-navy text-brand-lime"
                        : "bg-white/10 group-hover:bg-brand-lime group-hover:text-brand-navy",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ) : null}
                {!sidebarCollapsed && item.label}
              </Link>
              {!sidebarCollapsed && item.href === "/financial" && financialSectionActive && (
                <SidebarSubnav items={FINANCIAL_ITEMS} pathname={pathname} />
              )}
              {!sidebarCollapsed && item.href === "/settings" && settingsSectionActive && (
                <SidebarSubnav items={SETTINGS_ITEMS} pathname={pathname} />
              )}
              {!sidebarCollapsed && item.href === "/help" && helpSectionActive && (
                <SidebarSubnav items={HELP_ITEMS} pathname={pathname} />
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* Footer + Toggle */}
      <div className="border-t border-white/12 px-3 py-3">
        {!sidebarCollapsed && (
          <div className="mb-3 flex items-center gap-2 rounded-[1.15rem] border border-white/12 bg-white/[0.07] p-2.5">
            <FlowBuddy size="sm" />
            <p className="text-[11px] leading-snug text-white/60">
              Makin sedikit uang yang terbang tanpa jejak ✨
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Buka navigasi" : "Tutup navigasi"}
          className={cn(
            "focus-ring flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white",
            sidebarCollapsed && "justify-center",
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Tutup navigasi</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
