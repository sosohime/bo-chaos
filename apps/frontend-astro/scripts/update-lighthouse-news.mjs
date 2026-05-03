import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_URL = 'https://cloud.tencent.com/product/lighthouse?Is=sdk-topnav';
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/lighthouse-activities.json',
);

const SIGNAL_KEYWORDS = [
  'Lighthouse',
  'Hermes',
  'Agent',
  'OpenClaw',
  'OrcaTerm',
  'AI',
  '公测',
  '体验',
  '首发',
  '一键部署',
  '秒级部署',
  '最佳实践',
  '5分钟',
  '教程',
];

const SALES_KEYWORDS = [
  '大促',
  '免费活动',
  '新用户',
  '优惠',
  '特惠',
  '低至',
  '元/月',
  '元/年',
  '套餐',
];

const EXCLUDE_TITLES = new Set([
  '腾讯云',
  '最新活动',
  '产品',
  '解决方案',
  '定价',
  '企业中心',
  '云市场',
  '开发者',
  '客户支持',
  '合作与生态',
  '了解腾讯云',
  '立即选购',
  '产品控制台',
  '产品文档',
  '与云服务器CVM对比',
  '观看视频',
  '查看全部套餐',
  '立即购买',
  '立即注册',
  '立即申请',
  '开始使用',
]);

const CTA_PATTERN =
  /(立即购买|立即前往|即刻上手|立即领取|查看教程|查看部署教程|了解更多|前往控制台|活动规则>>|教程指南合集>>)\s*$/;

const CTA_ONLY_PATTERN =
  /^(立即购买|立即前往|即刻上手|立即领取|查看教程|查看部署教程|了解更多|前往控制台|开始使用)$/;

function decodeEntities(value) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function cleanText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttribute(source, name) {
  const match = source.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[2] ?? match?.[3] ?? match?.[4] ?? '';
}

function normalizeUrl(href) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
    return null;
  }

  return new URL(href, SOURCE_URL).toString();
}

function normalizeTitle(text) {
  return text
    .replace(/\s*[|｜]\s*/g, ' ')
    .replace(CTA_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSummary(title) {
  const summary = title
    .replace(/^Lighthouse独家支持\s*/, '')
    .replace(/^云端一键部署\s*/, '')
    .replace(/^产品体验\s*/, '')
    .replace(/^最佳实践\s*/, '')
    .trim();

  return summary === title ? '' : summary;
}

function buildContextTitle(html, anchorIndex, rawText) {
  if (!CTA_ONLY_PATTERN.test(rawText)) {
    return rawText;
  }

  const prefix = cleanText(html.slice(Math.max(0, anchorIndex - 320), anchorIndex));
  const context = prefix
    .replace(/^.*(?:相关产品|最新活动|搜索)\s*/, '')
    .replace(/\s*[|｜]\s*$/, '')
    .trim();

  if (!context || context.length < 4) {
    return rawText;
  }

  return context;
}

function getSignalScore(item) {
  const haystack = `${item.title} ${item.url}`;
  let score = 0;

  for (const keyword of SIGNAL_KEYWORDS) {
    if (haystack.includes(keyword)) {
      score += 2;
    }
  }

  if (haystack.includes('Hermes Agent')) {
    score += 10;
  }

  if (haystack.includes('一键部署') || haystack.includes('秒级部署')) {
    score += 4;
  }

  if (haystack.includes('公测') || haystack.includes('首发')) {
    score += 3;
  }

  if (haystack.includes('/developer/article/')) {
    score += 2;
  }

  if (haystack.includes('orcaterm.com')) {
    score += 2;
  }

  for (const keyword of SALES_KEYWORDS) {
    if (haystack.includes(keyword)) {
      score -= 8;
    }
  }

  return score;
}

function isSignalCandidate(item) {
  if (item.title.length < 4 || EXCLUDE_TITLES.has(item.title)) {
    return false;
  }

  const haystack = `${item.title} ${item.url}`;
  const hasUsefulUrl =
    item.url.includes('/act/') ||
    item.url.includes('/developer/article/') ||
    item.url.includes('/document/') ||
    item.url.includes('orcaterm.com') ||
    item.url.includes('console.cloud.tencent.com');
  const hasSignal = SIGNAL_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const hasSalesOnly = SALES_KEYWORDS.some((keyword) => haystack.includes(keyword));

  return hasUsefulUrl && hasSignal && (!hasSalesOnly || getSignalScore(item) > 0);
}

function parseActivities(html) {
  const anchors = html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi);
  const seen = new Set();
  const items = [];

  for (const anchor of anchors) {
    const href = getAttribute(anchor[1], 'href');
    const url = normalizeUrl(href);

    if (!url) {
      continue;
    }

    const anchorText =
      cleanText(anchor[2]) ||
      cleanText(getAttribute(anchor[1], 'title')) ||
      cleanText(getAttribute(anchor[1], 'aria-label'));
    const rawText = buildContextTitle(html, anchor.index ?? 0, anchorText);
    const title = normalizeTitle(rawText);

    if (!title) {
      continue;
    }

    const item = {
      title,
      summary: buildSummary(title),
      url,
      score: 0,
    };
    item.score = getSignalScore(item);

    if (!isSignalCandidate(item)) {
      continue;
    }

    const key = `${item.title}::${item.url}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(item);
  }

  return items
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map(({ score: _score, ...item }) => item);
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      'user-agent': 'bo-chaos-lighthouse-news/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Lighthouse page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const items = parseActivities(html);

  if (items.length === 0) {
    throw new Error('No Lighthouse activity links were found; leaving existing data untouched.');
  }

  const payload = {
    sourceUrl: SOURCE_URL,
    updatedAt: new Date().toISOString(),
    items,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(`${OUTPUT_PATH}.tmp`, `${JSON.stringify(payload, null, 2)}\n`);
  await rename(`${OUTPUT_PATH}.tmp`, OUTPUT_PATH);

  console.log(`Wrote ${items.length} Lighthouse activity links to ${OUTPUT_PATH}`);
}

await main();
