import { describe, expect, it } from 'vitest';
import {
  editorialRecords,
  newsRecords,
  productRecords,
  recordDate,
  sourceCount,
} from './news';
import { siteUrl } from '../lib/site-paths';
import { GET } from '../pages/rss.xml';

describe('source-backed publication', () => {
  it('keeps stable curated identifiers and every existing source reachable', () => {
    expect(new Set(editorialRecords.map((record) => record.id)).size).toBe(
      editorialRecords.length,
    );
    for (const record of editorialRecords) {
      expect(record.id).toMatch(/^[a-z0-9-]+$/);
      expect(record.paragraphs?.length).toBeGreaterThan(0);
      expect(record.context).toBeTruthy();
      expect(new URL(record.url).protocol).toBe('https:');
    }
    expect(sourceCount).toBe(
      new Set(newsRecords.map((record) => record.url)).size,
    );
  });
  it('never turns a product observation into a publication date or person article', () => {
    for (const record of productRecords) {
      expect(record.publishedAt).toBeUndefined();
      expect(record.paragraphs).toBeUndefined();
      expect(recordDate(record)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('keeps production canonicals independent from the dev navigation prefix', () => {
    expect(siteUrl('/news/token-and-daa/')).toBe(
      'https://yuanbo.online/retire/news/token-and-daa/',
    );
  });
  it('escapes feed URLs and omits dates for undated sources', async () => {
    const response = GET();
    const rss = await response.text();
    expect(response.headers.get('content-type')).toContain(
      'application/rss+xml',
    );
    expect(rss.match(/<item>/g)?.length).toBe(newsRecords.length);
    expect(rss.match(/<pubDate>/g)?.length).toBe(
      newsRecords.filter((record) => record.publishedAt).length,
    );
    expect(rss).toContain('initial=Y&amp;page=1');
    expect(rss).toContain('资料核对：');
    expect(rss).not.toContain('http://localhost');
  });
});
