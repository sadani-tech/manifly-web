"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight, Crown, DatabaseBackup, MessageSquare, ShieldCheck, UserCircle, Users, WalletCards } from "lucide-react";
import { whatsappV2Api, type WhatsappStatus } from "@/lib/api";

const groups = [
  { title: "Channel", items: [{ href: "/settings/whatsapp", label: "WhatsApp", description: "Koneksi, perintah, notifikasi, dan kuota.", icon: MessageSquare, status: true }, { href: "/settings/notifications", label: "Notifikasi", description: "Web Push dan pengingat harian.", icon: Bell }] },
  { title: "Akun", items: [{ href: "/settings/profile", label: "Profil & keamanan", description: "Nama, avatar, password, dan hapus akun.", icon: UserCircle }, { href: "/settings/membership", label: "Membership", description: "Plan, fitur, pembayaran, dan pemakaian.", icon: Crown }] },
  { title: "Keuangan", items: [{ href: "/pockets", label: "Pocket", description: "Kelola pocket, saldo awal, dan mata uang.", icon: WalletCards }, { href: "/settings/shared-wallet", label: "Shared Pocket", description: "Berbagi pencatatan dengan orang tepercaya.", icon: Users }] },
  { title: "Data & privasi", items: [{ href: "/settings/backup", label: "Backup & Restore", description: "Ekspor atau pulihkan salinan datamu.", icon: DatabaseBackup }, { href: "/settings/profile", label: "Privasi akun", description: "Kontrol avatar, data, dan penghapusan akun.", icon: ShieldCheck }] },
];

export default function SettingsPage() {
  const [whatsapp, setWhatsapp] = useState<WhatsappStatus | null>(null);
  useEffect(() => { whatsappV2Api.status().then(setWhatsapp).catch(() => setWhatsapp(null)); }, []);
  const status = whatsapp?.state === "connected" ? "Terhubung" : whatsapp?.state === "restricted" ? "Dibatasi" : "Belum terhubung";
  return <div className="space-y-8"><header><h2 className="text-3xl font-black sm:text-4xl">Pengaturan</h2><p className="mt-2 text-sm text-muted-foreground">Koneksi, akun, pocket, dan datamu—dikelompokkan supaya cepat ditemukan.</p></header>{groups.map((group) => <section key={group.title}><h3 className="mb-3 text-xs font-black uppercase tracking-[.16em] text-kicker">{group.title}</h3><div className="overflow-hidden rounded-[1.35rem] border bg-card">{group.items.map(({ href, label, description, icon: Icon, status: showStatus }, index) => <Link key={`${group.title}-${label}`} href={href} className={`focus-ring flex min-h-[5rem] items-center gap-3 p-4 hover:bg-muted/60 sm:px-5 ${index ? "border-t" : ""}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 font-bold">{label}{showStatus && <span className={`rounded-full px-2 py-0.5 text-[10px] ${whatsapp?.state === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{status}</span>}</span><span className="mt-0.5 block text-sm text-muted-foreground">{description}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link>)}</div></section>)}</div>;
}
