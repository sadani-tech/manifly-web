import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  route: string;
  intents: string[];
  keywords: string[];
  body: string;
}

export function getHelpArticles(): HelpArticle[] {
  const directory = path.join(process.cwd(), "content", "help");
  return fs.readdirSync(directory).filter((name) => name.endsWith(".md")).map((name) => parseArticle(fs.readFileSync(path.join(directory, name), "utf8"))).sort((a, b) => a.category.localeCompare(b.category, "id") || a.title.localeCompare(b.title, "id"));
}

export function getHelpArticle(slug: string) {
  return getHelpArticles().find((article) => article.slug === slug);
}

function parseArticle(source: string): HelpArticle {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Front-matter artikel Help tidak valid");
  const metadata = Object.fromEntries(match[1].split(/\r?\n/).map((line) => { const index = line.indexOf(":"); return [line.slice(0, index).trim(), line.slice(index + 1).trim()]; }));
  return { slug: metadata.slug, title: metadata.title, category: metadata.category, route: metadata.route, intents: metadata.intents ? metadata.intents.split(",").map((value) => value.trim()) : [], keywords: metadata.keywords.split(",").map((value) => value.trim()), body: match[2].trim() };
}
