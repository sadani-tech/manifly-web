"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircleMore } from "lucide-react";
import { Modal } from "@/components/shared/Modal";

const routeHelp: Array<[string, string, string]> = [
  ["/transactions", "transactions", "Mencatat Transaksi"], ["/budget", "budget", "Budget"], ["/recurring", "recurring", "Recurring"], ["/debts", "debts", "Utang Piutang"], ["/import", "scan-struk", "Scan Struk"], ["/categories", "categories", "Categories"], ["/pockets", "mulai", "Pocket"], ["/settings/whatsapp", "whatsapp", "WhatsApp"], ["/settings/membership", "membership", "Membership"], ["/financial", "financial", "Financial"], ["/dashboard", "dashboard", "Dashboard"],
  ["/smart-rules", "financial", "Smart Rules"], ["/plan", "financial", "Plan"], ["/net-worth", "financial", "Net Worth"], ["/analytics", "financial", "Analytics"], ["/financial-health", "financial", "Health"],
];

export function ContextualHelpDrawer({ open, onClose, pathname, title }: { open: boolean; onClose: () => void; pathname: string; title: string }) {
  const match = routeHelp.find(([route]) => pathname === route || pathname.startsWith(`${route}/`)) ?? ["/help", "mulai", "Mulai dengan Manifly"];
  return <Modal open={open} onClose={onClose} title={`Panduan ${title}`} description="Jawaban singkat tanpa meninggalkan pekerjaanmu."><div className="space-y-3"><Link href={`/help/${match[1]}`} onClick={onClose} className="focus-ring flex min-h-16 items-center gap-3 rounded-2xl border p-4 hover:bg-muted"><BookOpen className="h-5 w-5" /><span className="min-w-0 flex-1"><span className="block font-bold">{match[2]}</span><span className="block text-sm text-muted-foreground">Cara pakai di web dan WhatsApp</span></span><ArrowRight className="h-4 w-4" /></Link><Link href="/help" onClick={onClose} className="focus-ring flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-bold hover:bg-muted">Cari panduan lain <ArrowRight className="h-4 w-4" /></Link><Link href="/feedback" onClick={onClose} className="focus-ring flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-muted"><MessageCircleMore className="h-4 w-4" /> Masih bingung? Kirim pertanyaan</Link></div></Modal>;
}
