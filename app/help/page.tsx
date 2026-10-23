import { HelpCenterClient } from "@/components/help/HelpCenterClient";
import { getHelpArticles } from "@/lib/help-server";

export default function HelpPage() {
  const articles = getHelpArticles();
  return <div className="space-y-6"><header><p className="text-xs font-black uppercase tracking-[.16em] text-kicker">Help Center</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Mau melakukan apa?</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Cari panduan web dan WhatsApp dengan bahasa yang ringan.</p></header><HelpCenterClient articles={articles} /></div>;
}
