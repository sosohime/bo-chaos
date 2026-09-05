import { SITE_ORIGIN, siteUrl } from '../lib/site-paths';
import lighthouseActivities from '../data/lighthouse-activities.json';
import { editorialRecords } from '../data/news';

const lighthouseUpdated = lighthouseActivities.updatedAt.slice(0, 10);

const publicUrls: { url: string; lastModified?: string }[] = [
  { url: `${SITE_ORIGIN}/`, lastModified: lighthouseUpdated },
  { url: siteUrl('/yuanbo/'), lastModified: '2026-08-18' },
  { url: siteUrl('/bo/'), lastModified: lighthouseUpdated },
  { url: siteUrl('/bo/yuanbo-game/') },
  { url: siteUrl('/bo/codex-pet/') },
  { url: siteUrl('/bo/boge-skill/') },
  { url: siteUrl('/fans/') },
  { url: siteUrl('/reckful/') },
  ...editorialRecords.map((record) => ({
    url: siteUrl(`/news/${record.id}/`),
    lastModified: '2026-09-05',
  })),
];

export function GET() {
  const urls = publicUrls
    .map(
      ({ url, lastModified }) =>
        `<url><loc>${url}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ''}</url>`,
    )
    .join('');
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
