import Taro from "@tarojs/taro";
import { currentEntry } from "./entry";
import {
  clearGroupDisplayContext,
  setGroupDisplayContext,
} from "./group-display";
import type {
  ApiResponse,
  GroupRankBackgroundChoice,
  GroupRankBackgroundAsset,
  GroupRankTitleArt,
  GroupRankDefinition,
  GroupRankThemeId,
  GroupRankDraftDto,
  GroupRankProfile,
  GroupRankRecommendationDefinition,
  GroupRankBoardDetail,
  GroupRankBoardDto,
  GroupRankEntryDto,
  GroupRankSessionDto,
  GroupRankSpaceDto,
  GroupRankTemplate,
} from "@mono/types";

let generation = 0;
let session: {
  accessToken: string;
  expiresAt: number;
  generation: number;
} | null = null;
let entering: { generation: number; promise: Promise<string> } | null = null;

function clearSession() {
  session = null;
  clearGroupDisplayContext();
}

// A missing group context is an expected entry state, not a network failure.
export class GroupContextUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroupContextUnavailableError";
  }
}

export function invalidateGroupSession() {
  generation += 1;
  clearSession();
  entering = null;
  avatarCache.clear();
  backgroundCache.clear();
}

export function currentGroupGeneration() {
  return generation;
}

export function newRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function apiBase() {
  if (!GROUP_RANK_API_BASE_URL)
    throw new Error("群排行服务暂未开放，请稍后再试");
  return GROUP_RANK_API_BASE_URL;
}

async function transport<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  data?: unknown,
  token?: string,
): Promise<T> {
  let response: Taro.request.SuccessCallbackResult<
    ApiResponse<T> & { message?: string | string[] }
  >;
  try {
    response = await Taro.request({
      url: `${apiBase()}${path}`,
      method,
      data,
      timeout: 15000,
      header: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("网络连接失败，请稍后重试");
  }
  if (response.statusCode < 200 || response.statusCode >= 300) {
    if (response.statusCode === 401 && session?.accessToken === token)
      clearSession();
    const message = response.data?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join("；")
        : message || "暂时无法完成操作，请重试",
    );
  }
  if (!response.data || !("data" in response.data))
    throw new Error("服务返回异常，请稍后重试");
  return response.data.data;
}

async function enterGroup(currentGeneration: number): Promise<string> {
  apiBase();
  const login = await Taro.login();
  if (!login.code) throw new Error("微信登录失败，请重新打开");
  let group: Awaited<ReturnType<typeof Taro.getGroupEnterInfo>>;
  try {
    group = await Taro.getGroupEnterInfo();
  } catch {
    throw new GroupContextUnavailableError(
      "请从微信群里的群工具或小程序卡片重新打开，即可参与本群排行",
    );
  }
  if (
    !("encryptedData" in group) ||
    typeof group.encryptedData !== "string" ||
    !group.encryptedData ||
    !("iv" in group) ||
    typeof group.iv !== "string" ||
    !group.iv
  ) {
    throw new GroupContextUnavailableError(
      "暂时未能识别当前群，请从本群的群工具或卡片重新进入",
    );
  }
  if (generation !== currentGeneration)
    throw new Error("进入的群已变化，请刷新");
  const result = await transport<GroupRankSessionDto>("/session", "POST", {
    code: login.code,
    encryptedData: group.encryptedData,
    iv: group.iv,
  });
  if (generation !== currentGeneration)
    throw new Error("进入的群已变化，请刷新");
  if (
    !result ||
    typeof result.accessToken !== "string" ||
    !result.accessToken ||
    !Number.isFinite(result.expiresIn) ||
    result.expiresIn <= 5 ||
    typeof result.displayOpenGid !== "string" ||
    !result.displayOpenGid ||
    result.displayOpenGid.length > 256
  ) {
    clearSession();
    throw new Error("群会话信息不完整，请重试");
  }
  session = {
    accessToken: result.accessToken,
    expiresAt: Date.now() + result.expiresIn * 1000 - 5000,
    generation: currentGeneration,
  };
  setGroupDisplayContext(result.displayOpenGid, session.expiresAt);
  return result.accessToken;
}

async function token() {
  if (currentEntry().kind === "lobby") {
    clearSession();
    throw new GroupContextUnavailableError("请从本群的群工具或小程序卡片打开");
  }
  if (session?.generation === generation && session.expiresAt > Date.now())
    return session.accessToken;
  if (session) clearSession();
  if (entering?.generation === generation) return entering.promise;
  const entry = { generation, promise: enterGroup(generation) };
  entering = entry;
  try {
    return await entry.promise;
  } finally {
    if (entering === entry) entering = null;
  }
}

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
) {
  const requestGeneration = generation;
  const accessToken = await token();
  if (generation !== requestGeneration)
    throw new Error("进入的群已变化，请刷新");
  const result = await transport<T>(path, method, data, accessToken);
  if (generation !== requestGeneration)
    throw new Error("进入的群已变化，请刷新");
  return result;
}

const avatarCache = new Map<string, Promise<string>>();

async function avatar(userId: string, version: string): Promise<string> {
  const current = generation;
  const accessToken = await token();
  if (current !== generation) throw new Error("进入的群已变化，请刷新");
  const key = `${current}:${userId}:${version}`;
  let pending = avatarCache.get(key);
  if (!pending) {
    pending = (async () => {
      const result = await Taro.downloadFile({
        url: `${apiBase()}/profiles/${encodeURIComponent(userId)}/avatar?v=${encodeURIComponent(version)}`,
        header: { Authorization: `Bearer ${accessToken}` },
      });
      if (current !== generation) throw new Error("进入的群已变化，请刷新");
      if (result.statusCode === 401 && session?.accessToken === accessToken)
        clearSession();
      if (result.statusCode !== 200) throw new Error("头像暂时无法加载");
      return result.tempFilePath;
    })();
    avatarCache.set(key, pending);
    void pending.catch(() => avatarCache.delete(key));
  }
  return pending;
}

async function saveProfile(
  nickname: string,
  filePath?: string,
): Promise<GroupRankProfile> {
  if (!filePath)
    return request<GroupRankProfile>("/profile", "PATCH", { nickname });
  const current = generation;
  const info = await Taro.getFileInfo({ filePath });
  if (!("size" in info)) throw new Error("无法读取头像，请重新选择");
  if (info.size > 2 * 1024 * 1024)
    throw new Error("头像不能超过 2MB，请换一张");
  if (current !== generation) throw new Error("进入的群已变化，请刷新");
  const accessToken = await token();
  if (current !== generation) throw new Error("进入的群已变化，请刷新");
  const response = await Taro.uploadFile({
    url: `${apiBase()}/profile`,
    filePath,
    name: "file",
    formData: { nickname },
    header: { Authorization: `Bearer ${accessToken}` },
  });
  if (current !== generation) throw new Error("进入的群已变化，请刷新");
  if (response.statusCode === 401 && session?.accessToken === accessToken)
    clearSession();
  let result: ApiResponse<GroupRankProfile> & { message?: string };
  try {
    result = JSON.parse(response.data);
  } catch {
    throw new Error("资料保存结果异常，请重试");
  }
  if (response.statusCode < 200 || response.statusCode >= 300 || !result.data)
    throw new Error(result.message || "资料保存失败，请重试");
  return result.data;
}

const backgroundCache = new Map<string, Promise<string>>();
async function background(
  boardId: string,
  assetId: string,
  slot?: "cover" | "card",
  cropVersion?: string,
) {
  const current = generation,
    variant = slot && cropVersion ? `&slot=${slot}&crop=${encodeURIComponent(cropVersion)}` : "",
    key = `${current}:${boardId}:${assetId}${variant}`;
  const accessToken = await token();
  if (current !== generation) throw new Error("进入的群已变化，请刷新");
  let pending = backgroundCache.get(key);
  if (!pending) {
    pending = (async () => {
      const result = await Taro.downloadFile({
        url: `${apiBase()}/boards/${encodeURIComponent(boardId)}/background?v=${encodeURIComponent(assetId)}${variant}`,
        header: { Authorization: `Bearer ${accessToken}` },
      });
      if (result.statusCode === 401 && session?.accessToken === accessToken)
        clearSession();
      if (current !== generation || result.statusCode !== 200)
        throw new Error("背景暂时无法加载");
      return result.tempFilePath;
    })();
    backgroundCache.set(key, pending);
    void pending.catch(() => backgroundCache.delete(key));
  }
  return pending;
}
async function uploadBackground(
  filePath: string,
  requestId: string,
): Promise<GroupRankBackgroundAsset> {
  const current = generation;
  const file = await Taro.getFileInfo({ filePath });
  if (!("size" in file) || file.size > 4 * 1024 * 1024)
    throw new Error("背景图片不能超过 4MB");
  const login = await Taro.login();
  if (!login.code) throw new Error("微信登录失败，请重试");
  if (current !== generation) throw new Error("入口已变化，请重新选择");
  const response = await Taro.uploadFile({
    url: `${apiBase()}/backgrounds`,
    filePath,
    name: "file",
    formData: { code: login.code, requestId },
  });
  if (current !== generation) throw new Error("入口已变化，请重新选择");
  let result: ApiResponse<GroupRankBackgroundAsset> & { message?: string };
  try {
    result = JSON.parse(response.data);
  } catch {
    throw new Error("背景上传结果异常，请重试");
  }
  if (response.statusCode < 200 || response.statusCode >= 300 || !result.data)
    throw new Error(result.message || "背景审核失败，请换一张图片");
  return result.data;
}
const backgroundChoice = (value?: GroupRankBackgroundChoice | null) =>
  value
    ? {
        assetId: value.assetId,
        cover: value.cover,
        card: value.card,
        dim: value.dim,
      }
    : value;
export const groupApi = {
  background,
  uploadBackground,
  titleArt: (boardId: string) =>
    request<GroupRankTitleArt>(
      `/boards/${encodeURIComponent(boardId)}/title-art`,
    ),
  setAppearance: (
    boardId: string,
    themeId: GroupRankThemeId,
    background?: GroupRankBackgroundChoice | null,
    accentColor?: string | null,
  ) =>
    request<GroupRankBoardDto>(
      `/boards/${encodeURIComponent(boardId)}/appearance`,
      "PATCH",
      {
        themeId,
        ...(accentColor !== undefined ? { accentColor } : {}),
        ...(background !== undefined
          ? { background: backgroundChoice(background) }
          : {}),
      },
    ),
  proxySubmit: (
    boardId: string,
    data: { requestId: string; value: string } & (
      | { name: string; participantId?: never }
      | { participantId: string; name?: never }
    ),
  ) =>
    request<GroupRankEntryDto & { participantId: string }>(
      `/boards/${encodeURIComponent(boardId)}/proxy-entries`,
      "POST",
      data,
    ),
  proxyEntries: (boardId: string, participantId: string) =>
    request<GroupRankEntryDto[]>(
      `/boards/${encodeURIComponent(boardId)}/proxy-participants/${encodeURIComponent(participantId)}/entries`,
    ),
  proxyEdit: (
    boardId: string,
    entryId: string,
    value: string,
    revision: number,
  ) =>
    request<unknown>(
      `/boards/${encodeURIComponent(boardId)}/proxy-entries/${encodeURIComponent(entryId)}`,
      "PATCH",
      { value, revision },
    ),
  proxyRemove: (boardId: string, entryId: string) =>
    request<unknown>(
      `/boards/${encodeURIComponent(boardId)}/proxy-entries/${encodeURIComponent(entryId)}`,
      "DELETE",
    ),
  claim: (boardId: string, participantId: string) =>
    request<{ claimed: true }>(
      `/boards/${encodeURIComponent(boardId)}/proxy-participants/${encodeURIComponent(participantId)}/claim`,
      "POST",
      {},
    ),
  avatar,
  profile: () => request<GroupRankProfile>("/profile"),
  saveProfile,
  removeAvatar: () => request<GroupRankProfile>("/profile/avatar", "DELETE"),
  createDraft: async (definition: GroupRankDefinition, requestId: string) => {
    apiBase();
    const login = await Taro.login();
    if (!login.code) throw new Error("微信登录失败，请重试");
    return transport<GroupRankDraftDto>("/drafts", "POST", {
      code: login.code,
      requestId,
      definition: {
        ...definition,
        ...(definition.background !== undefined
          ? { background: backgroundChoice(definition.background) }
          : {}),
      },
    });
  },
  draft: (id: string) =>
    request<GroupRankDraftDto>(`/drafts/${encodeURIComponent(id)}`),
  createRecommendationBoard: (recommendation: GroupRankRecommendationDefinition, requestId: string) =>
    request<GroupRankBoardDto>("/boards", "POST", { recommendation, requestId }),
  recommend: (boardId: string, model: string, note?: string) =>
    request<{ recommended: true }>(`/boards/${encodeURIComponent(boardId)}/recommendations`, "POST", { model, ...(note ? { note } : {}) }),
  withdrawRecommendation: (boardId: string, itemId: string) =>
    request<{ withdrawn: true }>(`/boards/${encodeURIComponent(boardId)}/recommendations/${encodeURIComponent(itemId)}`, "DELETE"),
  createDraftBoard: (draftId: string, requestId: string) =>
    request<GroupRankBoardDto>("/boards", "POST", { draftId, requestId }),
  report: (id: string, reason: "inappropriate" | "privacy" | "other") =>
    request<{ reported: true }>(
      `/boards/${encodeURIComponent(id)}/reports`,
      "POST",
      { reason },
    ),
  removeBoard: (id: string) =>
    request<{ removed: true }>(`/boards/${encodeURIComponent(id)}`, "DELETE"),
  currentGroup: () => request<GroupRankSpaceDto>("/current-group"),
  // Official templates are public; browsing them must not create a group session.
  templates: () => transport<GroupRankTemplate[]>("/templates", "GET"),
  createBoard: (templateId: string, requestId: string) =>
    request<GroupRankBoardDto>("/boards", "POST", { templateId, requestId }),
  board: (boardId: string, cursor?: string) =>
    request<GroupRankBoardDetail>(
      `/boards/${encodeURIComponent(boardId)}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    ),
  submit: (boardId: string, value: string, requestId: string) =>
    request<GroupRankEntryDto>(
      `/boards/${encodeURIComponent(boardId)}/entries`,
      "POST",
      { value, requestId },
    ),
  edit: (boardId: string, entryId: string, value: string, revision: number) =>
    request<{ updated: true }>(
      `/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}`,
      "PATCH",
      { value, revision },
    ),
  remove: (boardId: string, entryId: string) =>
    request<{ deleted: true }>(
      `/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}`,
      "DELETE",
    ),
  status: (boardId: string, status: "open" | "paused" | "closed") =>
    request<GroupRankBoardDto>(
      `/boards/${encodeURIComponent(boardId)}/status`,
      "PATCH",
      { status },
    ),
};
