import { notFound } from "next/navigation";
import { HelpArticleView } from "@/components/help/HelpArticleView";
import { getHelpArticle, getHelpArticles } from "@/lib/help-server";

export function generateStaticParams() { return getHelpArticles().map(({ slug }) => ({ slug })); }
export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = getHelpArticle(slug); if (!article) notFound(); return <HelpArticleView article={article} />; }
