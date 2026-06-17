import type { PaginationParams } from "./response";

export type PhotoStatus = "reviewing" | "passed" | "rejected";
export type CategorySystem = "history" | "travel" | "tease";
export type UploadedPhotoStatusFilter = "pending" | "approved";

export interface PhotoCategoryDto {
  id: number;
  system: CategorySystem;
  systemName: string;
  name: string;
  updatedAt: string;
}

export interface CreatePhotoCategoryRequest {
  system: CategorySystem;
  systemName: string;
  name: string;
}

export interface PhotoDto {
  id: number;
  filename: string;
  name: string;
  description: string;
  viewedTimes: number;
  categoryId: number;
  status: PhotoStatus;
  authorOpenId: string | null;
  category?: PhotoCategoryDto;
  hasVoted?: boolean;
  votesCount?: number;
  published?: boolean;
}

export interface PhotoListParams extends PaginationParams {
  system?: CategorySystem;
  status?: UploadedPhotoStatusFilter;
}

export interface UploadPhotoRequest {
  name: string;
  system: CategorySystem;
  categoryId?: number;
  newCategory?: string;
}

export interface ReviewPhotoDto extends PhotoDto {
  category: PhotoCategoryDto;
}

export interface ReviewPhotoDecision {
  id: number;
  categoryId?: number;
  status: Extract<PhotoStatus, "passed" | "rejected">;
}

export interface ReviewPhotosRequest {
  photos: ReviewPhotoDecision[];
}

export interface VoteResponse {
  success: boolean;
  hasVoted: boolean;
  votesCount: number;
}

export interface KowtowStatsDto {
  iKowtowedToday: boolean;
  totalCount: number;
  todayKowtowedUser: number;
}

export interface KowtowRequest {
  count?: number;
}

export interface BofansSystemConfigType {
  inReview?: boolean;
}

export interface BoDailyCardDto {
  date: string;
  greeting: string;
  mood: string;
  title: string;
  insight: string;
  action: string;
  skill: {
    key: string;
    name: string;
    level: number;
    exp: number;
    nextLevelExp: number;
  };
  stats: {
    joinDays: number;
    kowtowCount: number;
    uploadCount: number;
    approvedCount: number;
    pendingCount: number;
  };
}
