import Link from 'next/link';
import { notFound } from 'next/navigation';
import Glossed from '@/components/glossed';
import { TERMS, firstUseSkips } from '@/lib/train/glossary';
import { ARTICLES, getArticle } from '@/lib/train/learn';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  return { title: a ? `${a.title} · Baseline` : 'Baseline' };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  // An article should not link to itself. The glossary defines everything, so
  // it opts out entirely rather than becoming a page of circular references.
  const own =
    a.slug === 'glossary'
      ? TERMS.map((t) => t.id)
      : TERMS.filter((t) => t.more === a.slug).map((t) => t.id);

  // One link per term per article. Without this, "compound lift" picks up a
  // dotted underline in all five paragraphs that mention it.
  const keys: string[] = [];
  const strings: string[] = [];
  a.body.forEach((section, i) => {
    section.p?.forEach((para, j) => { keys.push(`p-${i}-${j}`); strings.push(para); });
    section.list?.forEach((li, j) => { keys.push(`l-${i}-${j}`); strings.push(li); });
  });
  const skips = new Map(firstUseSkips(strings, own).map((s, i) => [keys[i], s]));
  const skipFor = (key: string) => skips.get(key) ?? own;

  return (
    <article className="space-y-4">
      <header>
        {a.unlocksWeek !== undefined && (
          <span className="chip mb-2">Unlocks in week {a.unlocksWeek}</span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
        <p className="muted mt-1">{a.oneLiner}</p>
      </header>

      {a.body.map((section, i) => (
        <section key={i} className="card">
          {section.h && <h2 className="card-title mb-2">{section.h}</h2>}
          {section.p && (
            <div className="prose-tight text-[15px]">
              {section.p.map((para, j) => (
                <p key={j}><Glossed text={para} skip={skipFor(`p-${i}-${j}`)} /></p>
              ))}
            </div>
          )}
          {section.list && (
            <ul className="list-disc pl-5 space-y-1.5 text-[15px] mt-2">
              {section.list.map((li, j) => (
                <li key={j}><Glossed text={li} skip={skipFor(`l-${i}-${j}`)} /></li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <Link href="/learn" className="btn btn-ghost w-full text-sm">All articles</Link>
    </article>
  );
}
