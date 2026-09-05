import { newsRecords } from '../data/news';
import { SITE_ORIGIN, siteUrl } from '../lib/site-paths';

const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!,
  );

export function GET() {
  const items = newsRecords
    .map((record) => {
      const link = record.paragraphs
        ? siteUrl(`/news/${record.id}/`)
        : record.url;
      const date = record.publishedAt
        ? `<pubDate>${new Date(`${record.publishedAt}T00:00:00+08:00`).toUTCString()}</pubDate>`
        : '';
      const description = `${record.summary}\n来源：${record.source}（${record.sourceType}）。${record.observedAt ? `资料核对：${record.observedAt}，不是发布日期。` : ''}\n原文：${record.url}`;
      return `<item><title>${xml(record.title)}</title><link>${xml(link)}</link><guid isPermaLink="true">${xml(link)}</guid><description>${xml(description)}</description><category>${xml(record.category)}</category>${date}</item>`;
    })
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>博新闻</title><link>${SITE_ORIGIN}/</link><description>博Fans独立整理的袁博与 Lighthouse 公开动态，每条内容附原始来源。</description><language>zh-CN</language><atom:link href="${siteUrl('/rss.xml')}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
