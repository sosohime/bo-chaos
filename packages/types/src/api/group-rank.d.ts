export type GroupRankThemeId = "volt" | "midnight" | "coral";

export interface GroupRankCrop { x: number; y: number; zoom: number; }
export interface GroupRankBackgroundChoice {
  assetId: string;
  cover: GroupRankCrop;
  card: GroupRankCrop;
  dim: number;
}
export interface GroupRankBackground extends GroupRankBackgroundChoice {
  imageWidth: number;
  imageHeight: number;
  renditions?: { cover: string; card: string };
}
export interface GroupRankBackgroundAsset { assetId: string; imageWidth: number; imageHeight: number; }

export interface GroupRankTitleArt {
  name: string;
  version: string;
  imageDataUri: string | null;
  width: number;
  height: number;
}

export type GroupRankAggregate = "latest" | "max" | "sum";
export type GroupRankBoardStatus = "open" | "paused" | "closed";

export type GroupRankEntryMode = "single" | "multiple";

export interface GroupRankRecommendationDefinition {
  name: string;
  description?: string;
}

export interface GroupRankTemplate {
  kind?: "recommendation";
  entryMode?: GroupRankEntryMode;
  background?: GroupRankBackground | null;
  themeId?: GroupRankThemeId;
  /** Optional shared accent; null follows the material theme. */
  accentColor?: string | null;
  id: string;
  version: number;
  name: string;
  description: string;
  metric: string;
  unit: string;
  precision: number;
  min: string;
  max: string;
  aggregate: GroupRankAggregate;
  direction: "asc" | "desc";
  period: "all_time" | "month";
  timeBasis: "submittedAt";
}

export interface GroupRankBoardDto {
  background?: GroupRankBackground | null;
  themeId?: GroupRankThemeId;
  /** Optional shared accent; null follows the material theme. */
  accentColor?: string | null;
  summary?: {
    leaders: GroupRankRow[];
    participantCount: number;
    winnerCount: number;
  };
  recommendationSummary?: {
    recommendationCount: number;
    todayCount: number;
    leaderModel: string | null;
    winnerCount: number;
  };
  id: string;
  creatorId: string;
  status: GroupRankBoardStatus;
  template: GroupRankTemplate;
  draftId?: string | null;
}

export interface GroupRankSessionDto {
  accessToken: string;
  expiresIn: number;
  /** Verified current group only; used by WeChat OpenData, never as authorization. */
  displayOpenGid: string;
}

export interface GroupRankSpaceDto {
  id: string;
  myUserId: string;
  memberCount: number;
  boards: GroupRankBoardDto[];
  myProfile?: GroupRankProfile;
}

export interface GroupRankEntryDto {
  recordedById?: string | null;
  id: string;
  value: string;
  revision: number;
  createdAt: string;
}

export interface GroupRankRow {
  participantId?: string;
  pendingClaim?: boolean;
  recordedById?: string | null;
  userId: string;
  displayName: string;
  avatarVersion?: string | null;
  score: string;
  rank: number;
}

export interface GroupRankRecommendationRow {
  id: string;
  model: string;
  rank: number;
  recommenders: GroupRankRecommender[];
}

export interface GroupRankRecommender extends GroupRankProfile {
  note?: string;
}

export interface GroupRankBoardDetail extends GroupRankBoardDto {
  myUserId: string;
  myProfile?: GroupRankProfile;
  ranking: GroupRankRow[];
  myEntries: GroupRankEntryDto[];
  recommendations?: { items: GroupRankRecommendationRow[]; limit: number };
  proxyParticipants?: GroupRankProxyParticipantDto[];
  historyHasMore: boolean;
  historyNextCursor: string | null;
}

export interface GroupRankDefinition {
  entryMode?: GroupRankEntryMode;
  background?: GroupRankBackgroundChoice | null;
  themeId?: GroupRankThemeId;
  /** Optional shared accent; null follows the material theme. */
  accentColor?: string | null;
  name: string;
  unit: string;
  aggregate: GroupRankAggregate;
  direction: "asc" | "desc";
  period: "all_time" | "month";
}

export interface GroupRankDraftDto {
  id: string;
  template: GroupRankTemplate;
  expiresAt: string | null;
}

export interface GroupRankProfile {
  userId: string;
  nickname: string | null;
  avatarVersion: string | null;
}

export interface GroupRankProxyParticipantDto {
  id: string;
  displayName: string;
}
