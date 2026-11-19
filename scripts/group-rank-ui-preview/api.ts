import type {
  GroupRankBoardDetail,
  GroupRankBoardDto,
  GroupRankTemplate,
  GroupRankSpaceDto,
  GroupRankThemeId,
} from "@mono/types";
// Design-only fixtures. This harness is excluded from the WeChat build and calls no service.
const search = new URLSearchParams(location.search);
const template: GroupRankTemplate = {
  id: "game-score",
  version: 1,
  name: "周末游戏高分",
  description: "每人最高一次成绩，同分并列。",
  metric: "填写分数",
  unit: "分",
  precision: search.get("long") === "true" ? 3 : 0,
  min: "0",
  max: "999999999",
  aggregate: "max",
  direction: "desc",
  period: "all_time",
  timeBasis: "submittedAt",
};
const people = [
  ["preview-wang", "阿望", "9860"],
  ["preview-lin", "林小满", "9420"],
  ["preview-me", "小何", "8800"],
  ["preview-li", "李同学", "8650"],
  ["preview-chen", "陈皮", "7920"],
];
const count = search.has("count") ? Number(search.get("count")) : 5;
const theme = (search.get("theme") || "volt") as GroupRankThemeId;
export const detail: GroupRankBoardDetail = {
  id: "board-volt",
  creatorId: search.get("creator") === "false" ? "preview-wang" : "preview-me",
  status: search.get("status") === "paused" ? "paused" : "open",
  themeId: theme,
  template,
  myUserId: "preview-me",
  myProfile: { userId: "preview-me", nickname: "小何", avatarVersion: null },
  ranking: people
    .slice(0, count)
    .map(([userId, displayName, score], i) => ({
      userId,
      displayName:
        search.get("long") === "true"
          ? "超长群友名称用于检查完整名字的排版与显示效果".slice(0, 24)
          : displayName,
      score:
        search.get("long") === "true"
          ? "999999998.999"
          : search.get("tie") === "true" && i < 2
            ? people[0][2]
            : score,
      rank: search.get("tie") === "true" && i < 2 ? 1 : i + 1,
      avatarVersion: null,
    })),
  myEntries:
    count > 2
      ? [
          {
            id: "entry-me",
            value: "8800",
            revision: 1,
            createdAt: "2026-10-30T04:00:00Z",
          },
        ]
      : [],
  proxyParticipants: [],
  historyHasMore: false,
  historyNextCursor: null,
};
// Synthetic decimal/long-name fixture: shape matches phone feedback, contains no real group data.
if (search.get("case") === "decimal") {
  detail.template = {
    ...template,
    name: "周末积分",
    unit: "分",
    precision: 3,
    aggregate: "latest",
  };
  detail.ranking = [
    {
      userId: "preview-wang",
      displayName: "山间来信",
      score: "668.000",
      rank: 1,
      avatarVersion: null,
    },
    {
      userId: "preview-me",
      displayName: "Moonlight on the weekend",
      score: "520.100",
      rank: 2,
      avatarVersion: null,
    },
  ];
  detail.myEntries = [
    {
      id: "entry-me",
      value: "520.100",
      revision: 1,
      createdAt: "2026-11-03T04:00:00Z",
    },
  ];
}
if (search.get("case") === "championship") {
  detail.template = {
    ...template,
    name: "尿酸王",
    unit: "μmol/L",
    precision: 3,
    aggregate: "latest",
  };
  const labels = ["山间来信", "小满", "阿川", "陈皮", "小何"];
  const scores = ["668.000", "520.100", "486.000", "432.000", "398.000"];
  detail.ranking = people.map(([userId], i) => ({
    userId,
    displayName: labels[i],
    score: scores[i],
    rank: i + 1,
    avatarVersion: "design-v5",
  }));
  detail.myUserId = "preview-chen";
  detail.creatorId =
    search.get("creator") === "false" ? "preview-wang" : "preview-chen";
  detail.myProfile = {
    userId: "preview-chen",
    nickname: "小何",
    avatarVersion: "design-v5",
  };
  detail.myEntries = [
    {
      id: "entry-me",
      value: "398.000",
      revision: 1,
      createdAt: "2026-11-03T04:00:00Z",
    },
  ];
}
if (search.get("case") === "proxy") {
  detail.template = {
    ...template,
    name: "纸面积分榜",
    unit: "μmol/L",
    precision: 3,
    aggregate: "latest",
  };
  detail.myUserId = "preview-lin";
  detail.creatorId =
    search.get("creator") === "false" ? "preview-me" : "preview-lin";
  detail.myProfile = {
    userId: "preview-lin",
    nickname: "Moonlight on the weekend",
    avatarVersion: "design-v5",
  };
  detail.ranking = [
    {
      userId: "proxy:example-a",
      participantId: "example-a",
      displayName: "山间来信",
      score: "668.000",
      rank: 1,
      pendingClaim: true,
      recordedById: "preview-lin",
      avatarVersion: null,
    },
    {
      userId: "preview-lin",
      displayName: "Moonlight on the weekend",
      score: "520.000",
      rank: 2,
      avatarVersion: "design-v5",
    },
    {
      userId: "proxy:example-c",
      participantId: "example-c",
      displayName: "小川",
      score: "300.000",
      rank: 3,
      pendingClaim: true,
      recordedById: "preview-lin",
      avatarVersion: null,
    },
    {
      userId: "proxy:example-d",
      participantId: "example-d",
      displayName: "阿满",
      score: "200.000",
      rank: 4,
      pendingClaim: true,
      recordedById: "preview-lin",
      avatarVersion: null,
    },
  ];
  detail.proxyParticipants = detail.ranking
    .filter((row) => row.pendingClaim)
    .map((row) => ({
      id: row.participantId!,
      displayName: row.displayName,
      claimantUserId: null,
      claimantName: null,
    }));
  detail.myEntries = [
    {
      id: "entry-me",
      value: "520.000",
      revision: 1,
      createdAt: "2026-11-04T04:00:00Z",
    },
  ];
}
if (search.get("score") && /^-?\d+(?:\.\d+)?$/.test(search.get("score")!))
  detail.ranking = detail.ranking.map((row) => ({
    ...row,
    score: search.get("score")!,
  }));
if (search.get("title"))
  detail.template = {
    ...detail.template,
    name: search.get("title")!.slice(0, 24),
  };
if (search.has("unit")) detail.template = { ...detail.template, unit: search.get("unit")!.slice(0, 12) };
if (search.get("name")) detail.ranking = detail.ranking.map((row, i) => i === 1 ? { ...row, displayName: search.get("name")!.slice(0, 24) } : row);
detail.ranking = detail.ranking.map((row) => ({
  ...row,
  avatarVersion: row.pendingClaim ? null : "design-v5",
}));
// Explicitly synthetic edge states for source-driven visual QA.
if (search.get("winner")) detail.ranking = detail.ranking.map((row, i) => i === 0 ? {...row, displayName: search.get("winner")!.slice(0,24)} : row);
if (search.get("tie") === "true") detail.ranking = detail.ranking.map((row, i) => i < 2 ? {...row, rank: 1, score: detail.ranking[0].score} : row);
detail.ranking = detail.ranking.slice(0, count);
const requestedParticipants = Number(search.get("participants"));
if (Number.isInteger(requestedParticipants) && requestedParticipants > detail.ranking.length && requestedParticipants <= 100) {
  const firstRank = detail.ranking.length + 1;
  const firstScore = Math.min(380, Number(detail.ranking[detail.ranking.length - 1]?.score || 400) - 7);
  detail.ranking = [...detail.ranking, ...Array.from({length:requestedParticipants-detail.ranking.length},(_,i)=>({userId:`preview-extra-${i}`,displayName:`样例群友${firstRank+i}`,score:String(firstScore-i*7),rank:firstRank+i,avatarVersion:null}))];
}
if (!detail.ranking.some(row=>row.userId===detail.myUserId)) detail.myEntries=[];
const cards: GroupRankBoardDto[] = [
  {
    ...detail,
    summary: {
      leaders: detail.ranking.slice(0, 3),
      participantCount: search.has("count") ? detail.ranking.length : 8,
      winnerCount: search.get("tie") === "true" ? 2 : count ? 1 : 0,
    },
  },
  {
    id: "board-midnight",
    creatorId: "preview-me",
    status: "open",
    themeId: "midnight",
    template: {
      ...template,
      id: "daily-steps",
      name: "今日步数",
      unit: "步",
      precision: 0,
    },
    summary: {
      leaders: [
        { userId: "preview-lin", displayName: "小满", score: "9860", rank: 1, avatarVersion: "design-v5" },
        { userId: "preview-me", displayName: "阿川", score: "9420", rank: 2, avatarVersion: "design-v5" },
        { userId: "preview-chen", displayName: "陈皮", score: "8800", rank: 3, avatarVersion: "design-v5" },
      ],
      participantCount: 12,
      winnerCount: 1,
    },
  },
  {
    id: "board-coral",
    creatorId: "preview-me",
    status: "paused",
    themeId: "coral",
    template: {
      ...template,
      id: "reading-pages",
      name: "读书页数",
      unit: "页",
      precision: 2,
      aggregate: "sum",
      period: "month",
    },
    summary: { leaders: [
      { userId: "preview-me", displayName: "阿川", score: "226", rank: 1, avatarVersion: "design-v5" },
      { userId: "preview-chen", displayName: "陈皮", score: "210", rank: 2, avatarVersion: "design-v5" },
      { userId: "preview-li", displayName: "小何", score: "188", rank: 3, avatarVersion: "design-v5" },
    ], participantCount: 6, winnerCount: 1 },
  },
];
// Explicit design-only multi-board density fixtures; never part of native runtime.
const catalogCount = Math.min(100, Math.max(3, Number(search.get("catalog")) || 3));
const extraCatalogRows = [
  ["跑步里程", "陈皮", "42.6", "km", "9"],
  ["引体向上", "小何", "24", "次", "5"],
  ["游戏高分", "阿望", "12860", "分", "18"],
  ["骑行里程", "林小满", "128.5", "km", "7"],
  ["跳绳次数", "小周", "1680", "次", "11"],
];
for (let i = 3; i < catalogCount; i++) {
  const [name, displayName, score, unit, participants] = extraCatalogRows[(i - 3) % extraCatalogRows.length];
  cards.push({
    ...cards[1], id: `catalog-${i}`,
    template: { ...template, name, unit },
    summary: { leaders: [{ userId: people[i % people.length][0], displayName, score, rank: 1, avatarVersion: "design-v5" }], participantCount: Number(participants), winnerCount: 1 },
  });
}
// Reference-content fixture for direct design comparison. Never included in dist.
// Reuses the five local synthetic portrait photos; identities are fixture-only.
if (search.get("case") === "fidelity") {
  const names = ["山间来信", "小满", "阿川", "陈皮", "小何", "晚枫", "老周", "阿泽", "星河", "大雄", "井岸"];
  const night = theme === "coral";
  const scores = night ? ["12.8","10.6","9.4","8.7","7.2","6.8","6.3","5.1","4.8","4.2","3.6"] : ["668","520.1","486","432","398","376","362","348","332","318","305"];
  const ordered = night ? [1,2,3,4,0,5,6,7,8,9,10] : names.map((_,i)=>i);
  detail.template = {...template,name:night?"夜跑里程":"尿酸王",unit:night?"km":"μmol/L",aggregate:"latest",precision:3};
  detail.ranking = ordered.map((identity,i)=>({userId:`fidelity-${identity}`,displayName:names[identity],score:scores[i],rank:i+1,avatarVersion:"design-fidelity"})).slice(0,search.has("count")?count:11);
  detail.myUserId = "fidelity-4";
  detail.creatorId = "fidelity-4";
  detail.myProfile = {userId:"fidelity-4",nickname:"小何",avatarVersion:"design-fidelity"};
  const own = detail.ranking.find(row=>row.userId===detail.myUserId);
  detail.myEntries = own ? [{id:"fidelity-entry",value:own.score,revision:1,createdAt:"2026-11-03T04:00:00Z"}] : [];
  const catalog = [
    ["尿酸王","μmol/L","668","volt",0],
    ["夜跑里程","km","12.8","coral",1],
    ["游戏高分","分","9860","midnight",2],
    ["阅读页数","页","126","volt",3],
    ["引体向上","次","18","volt",6],
  ] as const;
  cards.splice(0,cards.length,...catalog.map(([name,unit,score,themeId,identity],i)=>({...cards[0],id:i?`fidelity-board-${i}`:detail.id,themeId,template:{...template,name,unit},summary:{leaders:[{userId:`fidelity-${identity}`,displayName:names[identity],score,rank:1,avatarVersion:"design-fidelity"}],participantCount:11,winnerCount:1}})));
}
let group: GroupRankSpaceDto = {
  id: "preview-space",
  myUserId: detail.myUserId,
  memberCount: 7,
  myProfile: detail.myProfile,
  boards: search.get("state") === "empty" ? [] : search.get("catalog") === "1" ? cards.slice(0, 1) : cards,
};
// A synthetic user is still one identity across all boards in this fixture group.
const fixtureNames = new Map(detail.ranking.map(row => [row.userId, row.displayName]));
for (const card of cards)
  for (const row of card.summary?.leaders || [])
    row.displayName = fixtureNames.get(row.userId) || row.displayName;
export class GroupContextUnavailableError extends Error {}
export const currentGroupGeneration = () => 0;
export const hasGroupSession = () => true;
export const newRequestId = () => crypto.randomUUID();
const localBackgrounds=new Map<string,string>();
let boardReads = 0;
const wait = async (kind: string) => {
 const delay = Math.min(10000, Math.max(0, Number(search.get(kind + "Delay") || search.get("delay")) || 0));
 if (delay) await new Promise(resolve => setTimeout(resolve, delay));
 if (search.get("fail") === kind) throw new Error("网络暂时不可用，请重试");
};
export const groupApi = {
  background:async (_boardId:string,assetId:string)=>localBackgrounds.get(assetId) || "",
  uploadBackground:async(path:string)=>{const image=new Image();image.src=path;await image.decode();const assetId=crypto.randomUUID();localBackgrounds.set(assetId,path);return {assetId,imageWidth:image.naturalWidth,imageHeight:image.naturalHeight};},
  titleArt: async (boardId: string) => {
    if (search.get("art") === "off")
      throw new Error("artwork fallback preview");
    const r = await fetch(
      "/__design/title-art?name=" + encodeURIComponent(boardId === detail.id ? detail.template.name : cards.find(board => board.id === boardId)?.template.name || detail.template.name),
    );
    if (!r.ok) throw new Error("preview artwork unavailable");
    return r.json();
  },
  currentGroup: async () => {
    if (search.get("state") === "error") throw new Error("暂时无法连接，请稍后重试。");
    if (search.get("state") === "loading") return new Promise<GroupRankSpaceDto>(() => {});
    await wait("read");
    return group;
  },
  templates: async () => { await wait("read"); return [
    { ...template, id: "running-distance", name: "跑步里程", metric:"本次里程", unit: "km", aggregate: "sum" },
    { ...template, id: "pull-ups", name: "引体向上", metric:"连续次数", unit: "次" },
    { ...template, name: "游戏高分" },
  ]; },
  board: async (boardId: string) => {
    if (boardReads++ > 0 && search.get("refreshDelay")) await new Promise(resolve=>setTimeout(resolve,Number(search.get("refreshDelay"))));
    if (search.get("state") === "error" || search.get("failBoard") === boardId) throw new Error("暂时无法连接，请稍后重试。");
    if (search.get("state") === "loading") return new Promise<GroupRankBoardDetail>(() => {});
    await wait("read");
    const selected = cards.find(board => board.id === boardId);
    if (selected && selected.id !== detail.id) {
      const ranking = selected.summary?.leaders || [];
      const ownRow = ranking.find(row => row.userId === detail.myUserId);
      return { ...detail, ...selected, ranking, myEntries: ownRow ? [{ id: `preview-entry-${selected.id}`, value: ownRow.score, revision: 1, createdAt: "2026-11-03T04:00:00Z" }] : [] };
    }
    return { ...detail };
  },
  avatar: async (id: string) =>
    "/__design/avatar-" +
    (id.startsWith("fidelity-") ? Number(id.slice(9)) % 5 + 1 : Math.max(1, people.findIndex((p) => p[0] === id) + 1)) +
    ".png",
  draft: async (id: string) => {
    await wait("draft");
    return { id, template: { ...template, name: "周末游戏挑战", description: "记录周末的游戏成绩。" }, expiresAt: null };
  },
  createDraft: async (definition: any) => {
    const delay = Math.min(10000, Math.max(0, Number(search.get("saveDelay")) || 0));
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    return { id: "preview-draft", template: { ...template, ...definition }, expiresAt: null };
  },
  createDraftBoard: async () => detail,
  createBoard: async () => detail,
  setAppearance: async (id: string, themeId: GroupRankThemeId,background:any,accentColor?:string|null) => {
    await wait("appearance");
    const selected = cards.find(board => board.id === id);
    if (selected) { selected.themeId = themeId; selected.accentColor=accentColor; selected.background=background; }
    if (detail.id === id) {detail.themeId = themeId;detail.background=background;detail.accentColor=accentColor;}
    return { themeId,background,accentColor };
  },
  submit: async () => { await wait("save"); },
  edit: async () => { await wait("save"); },
  remove: async () => {},
  status: async (_id:string,status:any) => { detail.status=status; },
  report: async () => {},
  removeBoard: async () => {},
  proxySubmit: async () => { await wait("save"); },
  proxyEntries: async () => search.get("proxyHistory") === "long" ? Array.from({length:20},(_,i)=>({id:`proxy-entry-${i}`,value:String(668-i),revision:1,createdAt:"2026-11-11T08:00:00Z"})) : [],
  proxyEdit: async () => {},
  proxyRemove: async () => {},
  claim: async () => {},
  reviewClaim: async () => {},
  saveProfile: async () => detail.myProfile,
  removeAvatar: async () => detail.myProfile,
};
