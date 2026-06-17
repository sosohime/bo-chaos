export const PHOTO_STATUS = {
  REVIEWING: "reviewing",
  PASSED: "passed",
  REJECTED: "rejected",
} as const;

export const CATEGORY_SYSTEM = {
  HISTORY: "history",
  TRAVEL: "travel",
  TEASE: "tease",
} as const;

export const CATEGORY_SYSTEM_NAME = {
  [CATEGORY_SYSTEM.HISTORY]: "博史",
  [CATEGORY_SYSTEM.TRAVEL]: "博游",
  [CATEGORY_SYSTEM.TEASE]: "博逗",
} as const;
