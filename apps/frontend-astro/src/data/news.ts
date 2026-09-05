import activities from './lighthouse-activities.json';
import { sitePath } from '../lib/site-paths';

export type NewsCategory = '产品动态' | '公开分享' | '实践与观点' | '人物资料';
export interface NewsRecord {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  sourceType: string;
  url: string;
  publishedAt?: string;
  observedAt?: string;
  paragraphs?: string[];
  context?: string;
}

export const contentUpdated = activities.updatedAt.slice(0, 10);
export const categories: NewsCategory[] = [
  '产品动态',
  '公开分享',
  '实践与观点',
  '人物资料',
];

// These curated records have permanent detail URLs. Product-page banners below
// stay outbound so removing a banner cannot silently remove an indexed article.
export const editorialRecords: NewsRecord[] = [
  {
    id: 'lighthouse-cross-border-ai',
    title: 'Lighthouse 赋能跨境电商 AI 新增长',
    summary:
      '从跨境电商出海到 AI Agent 部署，袁博的公开演示资料记录了 Lighthouse 的应用场景。',
    category: '公开分享',
    source: '发现报告',
    sourceType: '收录的公开演示资料',
    url: 'https://www.fxbaogao.com/detail/5518348',
    publishedAt: '2026-07-07',
    paragraphs: [
      '这份公开演示资料的封面标注袁博为腾讯云轻量应用服务器产品经理，主题为 Lighthouse 赋能跨境电商 AI 新增长。',
      '资料围绕 Lighthouse 支持跨境电商出海与 AI Agent 场景展开，提供了观察轻量云产品应用方向的一份公开记录。完整方案和具体条件应以演示资料及对应产品说明为准。',
    ],
    context:
      '这是公开演示资料的收录页，可用于核对演讲主题和封面职务。演示资料不等同于独立媒体的人物报道。',
  },
  {
    id: 'enterprise-cloud-architecture',
    title: '企业信息化系统上云实践架构',
    summary:
      '从上云路径规划到跨 VPC 资产纳管，一篇公开实践文章记录了袁博提出的架构思路。',
    category: '实践与观点',
    source: '腾讯云开发者社区',
    sourceType: '公开实践文章',
    url: 'https://cloud.tencent.com/developer/article/2679014',
    publishedAt: '2026-05-31',
    paragraphs: [
      '腾讯云开发者社区的公开实践文章注明，其企业信息化系统上云与安全管理架构由袁博提出。',
      '文章涉及上云路径规划和跨 VPC IT 资产统一纳管。它为了解相关方案提供了具体入口，部署细节、适用条件与限制请阅读原文。',
    ],
    context:
      '这条记录反映原文对方案贡献的署名，不据此扩大为对全部产品、团队成果或行业地位的判断。',
  },
  {
    id: 'token-and-daa',
    title: '智能体时代，怎么看 Token 与 DAA',
    summary:
      '公开报道中，袁博谈到使用强度与使用广度：观察智能体生态，需要把两个维度放在一起看。',
    category: '实践与观点',
    source: '华夏时报',
    sourceType: '东方财富转载',
    url: 'https://wap.eastmoney.com/a/202605163739376785.html',
    publishedAt: '2026-05-16',
    paragraphs: [
      '在华夏时报的公开转载报道中，袁博以资深 OPC 专家身份讨论了智能体使用情况的观察指标。',
      '报道中的观点是：DAA 体现智能体使用广度，Token 体现使用强度，结合二者更适合观察生态健康度。本页为观点摘要，完整语境请以报道原文为准。',
    ],
    context:
      '这是一篇行业报道中的受访观点。来源中的身份称谓按原文保留，不将它当作独立认证或正式职务。',
  },
  {
    id: 'tencent-cloud-lecturer',
    title: '腾讯云认证讲师与 Lighthouse 产品经理',
    summary:
      '官方讲师资料介绍了袁博的腾讯云经历，以及云计算产品服务与策划工作。',
    category: '人物资料',
    source: '腾讯云开发者学习中心',
    sourceType: '官方讲师资料',
    url: 'https://cloud.tencent.cn/developer/learning',
    observedAt: '2026-08-18',
    paragraphs: [
      '腾讯云公开讲师资料显示，袁博于 2013 年加入腾讯云，长期从事云计算产品服务与策划，目前聚焦 Lighthouse 产品策划。',
      '这份资料可用于了解其公开职业身份。人物页汇总了其他来源中的相关描述，方便交叉查看。',
    ],
    context:
      '官方自有平台属于关联来源。页面未明确发布日期，所列日期是本站资料核对日期。',
  },
  {
    id: 'lighthouse-speaker-profile',
    title: '轻量云产品工作与企业上云经验',
    summary: '腾讯云沙龙讲师页介绍了袁博在轻量应用服务器产品与运营方面的工作。',
    category: '人物资料',
    source: '腾讯云开发者社区',
    sourceType: '官方沙龙讲师档案',
    url: 'https://cloud.tencent.com/developer/salon/speakers?initial=Y&page=1',
    observedAt: '2026-08-18',
    paragraphs: [
      '腾讯云沙龙讲师页将袁博列为轻量云高级产品经理，介绍其负责轻量应用服务器的产品经理及运营工作，并提及企业上云经验。',
      '不同时间的官方资料使用了不同的职务表述，本站按各自来源保留。最新职务与活动安排请查看官方讲师页面。',
    ],
    context:
      '讲师档案可支持公开职业描述；不能单凭它推断具体任职起止时间、私人经历或退休安排。',
  },
];

function productTitle(item: (typeof activities.items)[number]) {
  if (item.title.startsWith('云端托管个人 AI Agent')) {
    return new URL(item.url).hostname === 'lightvela.com'
      ? 'LightVela：云端托管个人 AI Agent'
      : '云端托管个人 AI Agent';
  }
  const deployment = item.title.match(/^云端一键部署\s+(OpenClaw|Hermes)/);
  if (deployment) return `${deployment[1]} 云端一键部署`;
  return item.summary || item.title;
}

export const productRecords: NewsRecord[] = activities.items.map((item) => ({
  id: item.url,
  title: productTitle(item),
  summary: item.summary || item.title,
  category: '产品动态',
  source: '腾讯云 Lighthouse 产品页',
  sourceType: item.category,
  url: item.url,
  observedAt: contentUpdated,
}));

export const newsRecords = [...productRecords, ...editorialRecords];
export const featuredRecord = editorialRecords[0];
export const sourceCount = new Set(newsRecords.map((record) => record.url))
  .size;
export const recordHref = (record: NewsRecord) =>
  record.paragraphs ? sitePath(`/news/${record.id}/`) : record.url;
export const recordDate = (record: NewsRecord) =>
  record.publishedAt ?? record.observedAt;
export const dateLabel = (record: NewsRecord) =>
  record.publishedAt ? '来源发布' : '资料核对';
