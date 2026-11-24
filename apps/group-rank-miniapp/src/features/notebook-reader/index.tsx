import { ActionButton, LoadStatus, PageSkeleton } from "../../components/async-feedback";
import { singleRecord } from "../../lib/record-policy";
import { validColor } from "../../lib/palette";
import AppearanceEditor from "../../components/appearance-editor";
import type { GroupRankBackground } from "@mono/types";
import BottomSheet, { SheetInput } from "../../components/bottom-sheet";
import PageFrame from "../../components/page-frame";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button, Text, View } from "@tarojs/components";
import Taro, {
  usePageScroll,
  useDidHide,
  useDidShow,
} from "@tarojs/taro";
import type {
  GroupRankBoardDetail,
  GroupRankBoardDto,
  GroupRankRow,
  GroupRankEntryDto,
  GroupRankProfile,
  GroupRankRecommendationRow,
  GroupRankThemeId,
} from "@mono/types";
import { currentGroupGeneration, groupApi, newRequestId } from "../../lib/api";
import { ownRankShareTitle, RANK_SHARE_KIND, SCORE_SHARE_KIND } from "../../lib/share";
import { formatScore } from "../../lib/format-score";
import { formatSubmittedAt } from "../../lib/format";
import { currentEntry, needsEntryNavigation } from "../../lib/entry";
import { consumeNativeMediaReturn, nativeMediaInProgress } from "../../lib/native-media";
import { themeId, themes } from "../../lib/theme";
import Avatar from "../../components/avatar";
import BoardPaper, { rankRowState } from "../../components/board-paper";
import { useViewport } from "../../lib/viewport";
import { folio, type PageDirection } from "../../lib/notebook";
import NotebookSheet from "../../components/page-corner";
import DirectoryPaperPreview from "../../components/directory-paper-preview";
import { createBoardWarmup } from "../../lib/board-warmup";
import { ProductIcon } from "../../components/activity-icon";
import ProxySheet from "../../components/proxy-sheet";
import ProfileSheet from "../../components/profile-sheet";
import { myRecommendations, RecommendationSheet, RecommendersSheet, type RecommendationDraft, type RecommendationMode } from "../../components/recommendation-ranking";
import "../../pages/board/index.scss";

export type ReaderPage = {
  directory: GroupRankBoardDto[];
  index: number;
  detail: GroupRankBoardDetail;
};

function openDirectory() {
  return Taro.reLaunch({ url: "/pages/index/index" });
}


function returnToDirectory() {
  const pages = Taro.getCurrentPages?.() ?? [];
  if (pages[pages.length - 2]?.route === "pages/index/index") {
    return Taro.navigateBack({ delta: 1 }).catch(openDirectory);
  }
  return openDirectory();
}

export function NotebookReader({
  initialPage,
  directoryPaper,
  startId = "",
  onDirectory = returnToDirectory,
  onBoardChange,
  onMenuScoreChange,
}: {
  initialPage?: ReaderPage;
  directoryPaper?: ReactNode;
  startId?: string;
  onDirectory?: () => void | Promise<unknown>;
  onBoardChange: (board: GroupRankBoardDetail | null) => void;
  onMenuScoreChange?: (boardId?: string) => void;
}) {
  const [page, setPage] = useState<ReaderPage | null>(initialPage ?? null);
  const [turning, setTurning] = useState(false);
  const [previousDetail, setPreviousDetail] = useState<GroupRankBoardDetail | null>(null);
  const [nextDetail, setNextDetail] = useState<GroupRankBoardDetail | null>(null);
  const [warmup] = useState(() => createBoardWarmup(groupApi.board, currentGroupGeneration));
  const [entryError, setEntryError] = useState("");
  const revision = useRef(0);
  const pending = useRef(false);

  async function read(directory?: GroupRankBoardDto[], index?: number, direction?: PageDirection) {
    if (pending.current) return;
    pending.current = true;
    const request = ++revision.current;
    const generation = currentGroupGeneration();
    const current = () => request === revision.current && generation === currentGroupGeneration();
    setEntryError("");
    setTurning(!!direction);
    try {
      const boards = directory ?? (await groupApi.currentGroup()).boards;
      if (!current()) return;
      const target = index ?? boards.findIndex((board) => board.id === startId);
      const board = boards[target];
      if (!board) throw new Error("本群目录里找不到这张榜单");
      const detail = await (direction ? warmup.read(board.id) : groupApi.board(board.id));
      if (!current()) return;
      if (detail.id !== board.id) throw new Error("榜单加载失败，请重试");
      if (page?.index === target - 1) setPreviousDetail(page.detail);
      if (page?.index === target + 1) setNextDetail(page.detail);
      if (page?.detail.id !== detail.id) onMenuScoreChange?.();
      onBoardChange(detail);
      setPage({ directory: boards, index: target, detail });
      if (direction) Taro.nextTick(() => {
        if (current()) void Taro.pageScrollTo({ scrollTop: 0, duration: 0 });
      });
    } catch (reason) {
      if (!current()) return;
      const message = reason instanceof Error ? reason.message : "榜单加载失败，请重试";
      if (direction) Taro.showToast({ title: message, icon: "none" });
      else setEntryError(message);
    } finally {
      if (request === revision.current) {
        pending.current = false;
        setTurning(false);
      }
    }
  }

  function clearReader() {
    revision.current += 1;
    pending.current = false;
    onMenuScoreChange?.();
    onBoardChange(null);
    setPage(null);
    setTurning(false);
    warmup.clear();
  }

  useDidShow(() => {
    if (initialPage) return;
    if (currentEntry().kind === "lobby" || needsEntryNavigation()) {
      clearReader();
      void openDirectory();
      return;
    }
    if (consumeNativeMediaReturn()) return;
    void read();
  });
  useDidHide(() => {
    if (!initialPage && !nativeMediaInProgress()) clearReader();
    else warmup.clear();
  });
  useEffect(() => () => {
    revision.current += 1;
    warmup.clear();
  }, [warmup]);
  useEffect(() => {
    if (!page) return;
    const { directory, index } = page;
    const nextId = directory[index + 1]?.id;
    const previousId = directory[index - 1]?.id;
    return warmup.schedule([nextId, previousId].filter(Boolean), detail => {
      if (detail.id === nextId) setNextDetail(detail);
      if (detail.id === previousId) setPreviousDetail(detail);
    });
  }, [page, warmup]);

  if (!page) return (
    <PageFrame className="board-screen theme--volt" title="博哥的小本儿">
      {entryError ? (
        <View className="panel board-error">
          <Text className="label">暂时无法查看</Text>
          <Text className="description">{entryError}</Text>
          <Button className="action small-action" onClick={() => read()}>重新加载</Button>
          <Button className="text-action" onClick={onDirectory}>返回目录</Button>
        </View>
      ) : <PageSkeleton variant="board" />}
    </PageFrame>
  );
  async function turnToDirectory() {
    if (pending.current) return;
    pending.current = true;
    const current = ++revision.current;
    setTurning(true);
    try {
      await onDirectory();
    } catch {
      if (revision.current === current)
        Taro.showToast({ title: "暂时无法返回目录", icon: "none" });
    } finally {
      if (revision.current === current) {
        pending.current = false;
        setTurning(false);
      }
    }
  }

  return (
    <BoardLeaf page={page} nextDetail={nextDetail} previousDetail={previousDetail} directoryPaper={directoryPaper} turning={turning} onDirectory={onDirectory} onProfileChange={warmup.clear} onBoardChange={onBoardChange} onMenuScoreChange={onMenuScoreChange} onTurn={(direction) => {
      const next = page.index + direction;
      if (next === -1) void turnToDirectory();
      else if (next < page.directory.length) void read(page.directory, next, direction);
    }} />
  );
}

function BoardLeaf({ page, nextDetail, previousDetail, directoryPaper, turning, onDirectory, onProfileChange, onBoardChange, onMenuScoreChange, onTurn }: {
  page: ReaderPage;
  nextDetail: GroupRankBoardDetail | null;
  previousDetail: GroupRankBoardDetail | null;
  directoryPaper?: ReactNode;
  turning: boolean;
  onDirectory: () => void | Promise<unknown>;
  onProfileChange: () => void;
  onBoardChange: (board: GroupRankBoardDetail | null) => void;
  onMenuScoreChange?: (boardId?: string) => void;
  onTurn: (direction: PageDirection) => void;
}) {
  const boardId = page.detail.id;
  const [localDetail, setLocalDetail] = useState<{
    source: GroupRankBoardDetail;
    value: GroupRankBoardDetail | null;
  } | null>(null);
  const detail = localDetail?.source === page.detail ? localDetail.value : page.detail;
  function setDetail(update: GroupRankBoardDetail | null | ((previous: GroupRankBoardDetail | null) => GroupRankBoardDetail | null)) {
    setLocalDetail(previous => {
      const current = previous?.source === page.detail ? previous.value : page.detail;
      return { source: page.detail, value: typeof update === "function" ? update(current) : update };
    });
  }
  const rankShareTitle = ownRankShareTitle(detail);
  const scrollOffset = useRef(0);
  const sheetShowing = useRef(false);
  const { height, status, header } = useViewport();
  usePageScroll(({ scrollTop }) => {
    if (!sheetShowing.current) scrollOffset.current = scrollTop;
  });
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<GroupRankEntryDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [continueSubmit, setContinueSubmit] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [recommendationMode, setRecommendationMode] = useState<RecommendationMode | null>(null);
  const [recommendationDraft, setRecommendationDraft] = useState<RecommendationDraft | null>(null);
  const [modelQuery, setModelQuery] = useState("");
  const [peopleItemId, setPeopleItemId] = useState("");
  const peopleItem = detail?.recommendations?.items.find(item => item.id === peopleItemId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyScrollTop = useRef(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuScore, setMenuScore] = useState<string>();
  const [themeOpen, setThemeOpen] = useState(false);
  const [chosenBackground, setChosenBackground] =
    useState<GroupRankBackground | null>(null);
  const [chosenColor, setChosenColor] = useState<string | null>(null);
  const [chosenTheme, setChosenTheme] = useState<GroupRankThemeId>("volt");
  const [themeError, setThemeError] = useState("");
  const [themeBusy, setThemeBusy] = useState(false);
  const themeLock = useRef(false);
  const activeTheme = themeId(detail?.themeId);
  const mine = detail?.ranking.find((row) => row.userId === detail.myUserId);
  const existingSingle = detail ? singleRecord(detail.template, detail.myEntries) : null;
  const [proxyOpen, setProxyOpen] = useState(false);
  const [proxyInitialId, setProxyInitialId] = useState("");
  const [profileSubmitLabel, setProfileSubmitLabel] =
    useState("保存并提交成绩");
  const profileContinuation = useRef<
    ((profile: GroupRankProfile) => void) | null
  >(null);
  const claimDialog = useRef(false);
  const lock = useRef(false);
  const historyLock = useRef(false);
  const sequence = useRef(0);
  const submission = useRef<{ value: string; requestId: string } | null>(null);

  sheetShowing.current =
    !!detail &&
    (scoreOpen ||
      !!recommendationMode ||
      !!peopleItem ||
      proxyOpen ||
      profileOpen ||
      themeOpen ||
      manageOpen ||
      shareOpen ||
      historyOpen ||
      rulesOpen);

  async function load() {
    const current = ++sequence.current;
    setRefreshing(true);
    setError("");
    try {
      if (!boardId) throw new Error("榜单入口无效，请返回本群首页");
      const board = await groupApi.board(boardId);
      if (sequence.current !== current) return;
      if (board.id !== boardId) throw new Error("榜单加载失败，请重试");
      setDetail(board);
      onBoardChange(board);
      return true;
    } catch (reason) {
      if (sequence.current === current) {
        setDetail(null);
        onBoardChange(null);
        setError(reason instanceof Error ? reason.message : "无法加载榜单");
      }
      return false;
    } finally {
      if (sequence.current === current) setRefreshing(false);
    }
  }
  useEffect(() => {
    setError("");
    setValue("");
    setEditing(null);
    setScoreError("");
    setRecommendationMode(null);
    setRecommendationDraft(null);
    setModelQuery("");
    setPeopleItemId("");
    setMenuScore(undefined);
    historyScrollTop.current = 0;
    submission.current = null;
    return () => {
      sequence.current += 1;
      profileContinuation.current = null;
    };
  }, [boardId]);


  async function act(
    operation: () => Promise<unknown>,
    contribution = false,
    successTitle = contribution ? "记下了" : "已更新",
    onSuccess?: () => void,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    const current = sequence.current;
    try {
      await operation();
      if (sequence.current !== current) return;
      const refreshed = await load();
      if (sequence.current !== current + 1) return;
      setEditing(null);
      setValue("");
      setScoreOpen(false);
      setManageOpen(false);
      onSuccess?.();
      Taro.showToast({
        title: refreshed ? successTitle : `${successTitle}，请刷新榜单`,
        icon: refreshed ? "success" : "none",
      });
    } catch (reason) {
      if (sequence.current !== current) return;
      const message = reason instanceof Error ? reason.message : "操作失败，请重试";
      if (scoreOpen || recommendationMode || contribution || editing) setScoreError(message);
      else Taro.showToast({title: message, icon: "none"});
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function save(savedProfile?: GroupRankProfile) {
    setScoreError("");
    if (!value.trim()) {
      setScoreError("先填写成绩");
      return;
    }
    const profile = savedProfile || detail?.myProfile;
    if (!profile?.nickname?.trim() || !profile.avatarVersion) {
      profileContinuation.current = (updated) => {
        void save(updated);
      };
      setProfileSubmitLabel("保存并提交成绩");
      setContinueSubmit(true);
      setProfileOpen(true);
      return;
    }
    if (editing)
      return act(
        () =>
          groupApi.edit(boardId, editing.id, value.trim(), editing.revision),
        false,
        "修改已保存",
      );
    const normalized = value.trim();
    if (submission.current?.value !== normalized)
      submission.current = { value: normalized, requestId: newRequestId() };
    const pending = submission.current;
    return act(async () => {
      await groupApi.submit(boardId, pending.value, pending.requestId);
      submission.current = null;
    }, true);
  }

  function openRecommendations(mode: RecommendationMode) {
    setScoreError("");
    setModelQuery("");
    setRecommendationDraft(null);
    setRecommendationMode(mode);
  }

  function changeRecommendationDraft(draft: RecommendationDraft | null) {
    if (draft?.model !== recommendationDraft?.model)
      void Promise.resolve(Taro.hideKeyboard?.()).catch(() => {});
    setScoreError("");
    setRecommendationDraft(draft);
  }

  function recommendModel(draft: RecommendationDraft, savedProfile?: GroupRankProfile) {
    if (detail?.status !== "open" || lock.current) return;
    setScoreError("");
    void Promise.resolve(Taro.hideKeyboard?.()).catch(() => {});
    const profile = savedProfile || detail.myProfile;
    if (!profile?.nickname?.trim() || !profile.avatarVersion) {
      profileContinuation.current = updated => recommendModel(draft, updated);
      setProfileSubmitLabel("保存并推荐");
      setContinueSubmit(true);
      setProfileOpen(true);
      return;
    }
    return act(() => groupApi.recommend(boardId, draft.model, draft.note.trim() || undefined),
      false, "已推荐", () => setRecommendationDraft(null));
  }

  function withdrawRecommendation(item: GroupRankRecommendationRow) {
    setScoreError("");
    return act(() => groupApi.withdrawRecommendation(boardId, item.id), false, "已撤回");
  }

  function openProxy(participantId = "") {
    if (!detail || turning || detail.creatorId !== detail.myUserId || lock.current) return;
    // Proxy names belong only to pending participants, never to the creator's profile flow.
    profileContinuation.current = null;
    setContinueSubmit(false);
    setProfileOpen(false);
    setProxyInitialId(participantId);
    setProxyOpen(true);
  }
  async function claimParticipant(
    participantId: string,
    savedProfile?: GroupRankProfile,
  ) {
    if (!detail || turning || lock.current || claimDialog.current) return;
    const person = detail.proxyParticipants?.find(
      (item) => item.id === participantId,
    );
    if (!person) return;
    const profile = savedProfile || detail.myProfile;
    if (!profile?.nickname?.trim() || !profile.avatarVersion) {
      profileContinuation.current = (updated) => {
        void claimParticipant(participantId, updated);
      };
      setProfileSubmitLabel("保存并继续认领");
      setContinueSubmit(true);
      setProfileOpen(true);
      return;
    }
    claimDialog.current = true;
    const current = sequence.current;
    const generation = currentGroupGeneration();
    try {
      const answer = await Taro.showModal({
        title: `认领“${person.displayName}”？`,
        content: detail.template.entryMode === "single"
          ? "认领后，这些成绩会进入「我的记录」。同一期只能保留一笔。"
          : "认领后，这些成绩会合并到你的「我的记录」。请只认领自己的成绩。",
        confirmText: "确认认领",
      });
      if (
        answer.confirm &&
        current === sequence.current &&
        generation === currentGroupGeneration()
      )
        await act(() => groupApi.claim(boardId, participantId), false, "已认领");
    } catch (reason) {
      if (current === sequence.current)
        Taro.showToast({
          title:
            reason instanceof Error
              ? reason.message
              : "暂时无法打开确认，请重试",
          icon: "none",
        });
    } finally {
      claimDialog.current = false;
    }
  }
  async function remove(entry: GroupRankEntryDto) {
    const current = sequence.current;
    const result = await Taro.showModal({
      title: "删除这条成绩？",
      content: "删除后将重新计算排名，此操作无法撤销。",
      confirmText: "删除",
    });
    if (result.confirm && sequence.current === current)
      void act(() => groupApi.remove(boardId, entry.id));
  }

  function updateProfile(profile: GroupRankProfile) {
    onProfileChange();
    setDetail((previous) =>
      previous
        ? {
            ...previous,
            myProfile: profile,
            ranking: previous.ranking.map((row) =>
              row.userId === profile.userId
                ? {
                    ...row,
                    displayName:
                      profile.nickname || `群友 ${profile.userId.slice(-4)}`,
                    avatarVersion: profile.avatarVersion,
                  }
                : row,
            ),
          }
        : null,
    );
  }
  async function report() {
    const current = sequence.current;
    try {
      const choice = await Taro.showActionSheet({
        itemList: ["不当内容", "涉及隐私", "其他问题"],
      });
      if (current !== sequence.current) return;
      await groupApi.report(
        boardId,
        (["inappropriate", "privacy", "other"] as const)[choice.tapIndex],
      );
      if (current === sequence.current)
        Taro.showToast({ title: "已提交举报", icon: "success" });
    } catch (reason) {
      if (reason instanceof Error && current === sequence.current)
        Taro.showToast({ title: reason.message, icon: "none" });
    }
  }
  async function removeBoard() {
    if (lock.current) return;
    const current = sequence.current;
    const result = await Taro.showModal({
      title: "移除这个榜单？",
      content: "移除后群友将无法查看或继续记成绩。此操作无法撤销。",
      confirmText: "移除",
    });
    if (!result.confirm || current !== sequence.current || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await groupApi.removeBoard(boardId);
      if (current === sequence.current)
        await Taro.reLaunch({ url: "/pages/index/index" });
    } catch (reason) {
      if (current === sequence.current)
        Taro.showToast({
          title: reason instanceof Error ? reason.message : "移除失败，请重试",
          icon: "none",
        });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function moreHistory() {
    if (!detail?.historyNextCursor || historyLock.current) return;
    historyLock.current = true;
    setHistoryLoading(true);
    const current = sequence.current;
    try {
      const next = await groupApi.board(boardId, detail.historyNextCursor);
      if (sequence.current === current && next.id === boardId) {
        onBoardChange(next);
        setDetail((previous) =>
          previous
            ? {
                ...next,
                myEntries: [
                  ...previous.myEntries,
                  ...next.myEntries.filter(
                    (entry) =>
                      !previous.myEntries.some(
                        (existing) => existing.id === entry.id,
                      ),
                  ),
                ],
              }
            : null,
        );
      }
    } catch (reason) {
      if (sequence.current !== current) return;
      Taro.showToast({
        title: reason instanceof Error ? reason.message : "加载失败",
        icon: "none",
      });
    } finally {
      historyLock.current = false;
      setHistoryLoading(false);
    }
  }

  function openAppearance() {
    setChosenTheme(activeTheme);
    setChosenColor(validColor(detail?.accentColor));
    setChosenBackground(detail?.background || null);
    setThemeError("");
    setThemeOpen(true);
  }
  async function saveAppearance(
    nextTheme = chosenTheme,
    nextBackground = chosenBackground,
    nextColor = chosenColor,
  ) {
    if (!detail || detail.creatorId !== detail.myUserId || themeLock.current)
      return;
    themeLock.current = true;
    setThemeBusy(true);
    setThemeError("");
    const current = sequence.current;
    try {
      const updated = await groupApi.setAppearance(
        boardId,
        nextTheme,
        nextBackground,
        nextColor,
      );
      if (current !== sequence.current) return;
      if (updated.themeId !== nextTheme || validColor(updated.accentColor) !== validColor(nextColor))
        throw new Error("主题还没有保存成功，请重试");
      setDetail((previous) =>
        previous
          ? {
              ...previous,
              themeId: updated.themeId,
              accentColor: updated.accentColor,
              background: updated.background,
            }
          : null,
      );
      setThemeOpen(false);
      Taro.showToast({ title: "外观已保存", icon: "success" });
    } catch (reason) {
      if (current === sequence.current)
        setThemeError(
          reason instanceof Error ? reason.message : "主题保存失败，请重试",
        );
    } finally {
      themeLock.current = false;
      setThemeBusy(false);
    }
  }

  function rankAction(row: GroupRankRow) {
    if (!detail || !row.participantId) return;
    const state = rankRowState(detail, row);
    if (state === "proxy") return () => openProxy(row.participantId);
    if (state === "claim") return () => { void claimParticipant(row.participantId!); };
  }

  const turnLocked = turning || refreshing || busy || themeBusy || sheetShowing.current;
  function turn(direction: PageDirection) {
    if (!turnLocked && !lock.current && !claimDialog.current) onTurn(direction);
  }
  const [turnPulse, setTurnPulse] = useState(0);
  function requestTurn(direction: PageDirection) {
    if (!turnLocked && !lock.current && !claimDialog.current)
      setTurnPulse(value => (Math.abs(value) + 1) * direction);
  }
  const hasNextPage = page.index + 1 < page.directory.length;
  const recordLabel = existingSingle ? "修改成绩" : detail?.ranking.length ? "记一笔" : "记第一笔";
  const canRecommendMore = detail?.status === "open" && !!detail.recommendations &&
    myRecommendations(detail).length < detail.recommendations.limit;

  return (
    <PageFrame
      accentColor={detail?.accentColor}
      nativeTitle={detail?.template.name}
      className={`board-screen notebook-board theme--${activeTheme}`}
      title={detail?.template.name || page.detail.template.name}
      scrollLocked={sheetShowing.current}
      scrollOffset={scrollOffset.current}
      header={
        <View className="board-header">
          <Button
            className="board-back"
            onClick={onDirectory}
            ariaLabel="返回目录"
          >
            ‹
          </Button>
        </View>
      }
    >
      <View
        className="page board-page"
        style={{ minHeight: height ? `${Math.max(0, height - status - header)}px` : undefined }}
      >
        {!detail && !error && (
          <PageSkeleton variant="board" />
        )}
        {error && !detail && (
          <View className="panel board-error">
            <Text className="label">暂时无法查看</Text>
            <Text className="description">{error}</Text>
            <Button className="action small-action" onClick={() => load()}>
              重新加载
            </Button>
            <Button
              className="text-action"
              onClick={onDirectory}
            >
              返回目录
            </Button>
          </View>
        )}
        {detail && (
          <>
            {refreshing && <View className="board-refreshing"><LoadStatus label="正在更新榜单" compact /></View>}
            <NotebookSheet
              label={hasNextPage ? "翻到下一页" : ""}
              backLabel={page.index === 0 ? "翻回目录" : "翻到上一页"}
              leafKey={boardId}
              disabled={turnLocked}
              turnPulse={turnPulse}
              onTurn={turn}
              next={nextDetail && nextDetail.id === page.directory[page.index + 1]?.id
                ? <BoardPaper detail={nextDetail} /> : undefined}
              previous={page.index === 0
                ? directoryPaper ?? <DirectoryPaperPreview boards={page.directory} />
                : previousDetail && previousDetail.id === page.directory[page.index - 1]?.id
                  ? <BoardPaper detail={previousDetail} /> : undefined}
            >
              <BoardPaper
                detail={detail}
                busy={busy || turning}
                actions={{
                  onRankAction: rankAction,
                  onRules: () => { if (!turning) setRulesOpen(true); },
                  onMore: () => { if (!turning) setManageOpen(true); },
                  onShare: () => setShareOpen(true),
                  onProxy: !detail.recommendations && detail.creatorId === detail.myUserId ? () => openProxy() : undefined,
                  onPeople: detail.recommendations ? setPeopleItemId : undefined,
                  onMyRecommendations: detail.recommendations ? () => openRecommendations("manage") : undefined,
                  onHistory: () => setHistoryOpen(true),
                  onProfile: () => {
                    setContinueSubmit(false);
                    profileContinuation.current = null;
                    setProfileOpen(true);
                  },
                }}
              />
            </NotebookSheet>
            {rulesOpen && (
              <BottomSheet
                className="rules-sheet"
                header={
                  <View className="profile-heading">
                    <Text className="section-title">榜单规则</Text>
                    <Button
                      className="text-action"
                      onClick={() => setRulesOpen(false)}
                    >
                      关闭
                    </Button>
                  </View>
                }
              >
                {detail.template.description && <Text className="description">{detail.template.description}</Text>}
                {detail.recommendations ? <Text className="note">每人最多推荐 {detail.recommendations.limit} 个型号，同一型号每人计一次。按推荐人数排名，同票并列。你可以撤回自己的推荐。</Text> : <>
                <Text className="note">
                  {detail.template.entryMode === "single" ? "每人一笔，可修改原记录" : "允许多笔记录"}
                </Text>
                <Text className="description">
                  {detail.template.aggregate === "latest"
                    ? "最近一次成绩"
                    : detail.template.aggregate === "sum"
                      ? "累计成绩"
                      : "最高成绩"}{" "}
                  ·{" "}
                  {detail.template.direction === "asc"
                    ? "低分靠前"
                    : "高分靠前"}{" "}
                  ·{" "}
                  {detail.template.period === "month"
                    ? "北京时间本月"
                    : "长期记录"}
                </Text>
                <Text className="note">
                  填写 {detail.template.min}—{detail.template.max}，
                  {detail.template.precision === 0
                    ? "只填整数"
                    : `最多 ${detail.template.precision} 位小数`}
                  。同分并列。
                </Text>
                </>}
              </BottomSheet>
            )}
            {!!detail.proxyParticipants?.filter(
              (person) =>
                !detail.ranking.some((row) => row.participantId === person.id),
            ).length && (
              <View className="panel proxy-names">
                <Text className="label">待认领名单</Text>
                <Text className="note">
                  这些名字暂无本期排名，历史记录仍可认领。
                </Text>
                {detail.proxyParticipants
                  .filter(
                    (person) =>
                      !detail.ranking.some(
                        (row) => row.participantId === person.id,
                      ),
                  )
                  .map((person) => (
                    <View className="proxy-name-row" key={person.id}>
                      <View className="rank-person-identity">
                        <Text>{person.displayName}</Text>
                        <Text className="rank-proxy-badge">代填</Text>
                      </View>
                      {detail.creatorId === detail.myUserId ? (
                        <Button
                          className="text-action"
                          disabled={busy}
                          onClick={() => openProxy(person.id)}
                        >
                          代填记录
                        </Button>
                      ) : (
                        <Button
                          className="text-action claim-name-cta"
                          disabled={busy}
                          onClick={() => claimParticipant(person.id)}
                        >
                          这是我
                        </Button>
                      )}
                    </View>
                  ))}
              </View>
            )}
            {historyOpen && !scoreOpen && !profileOpen && (
              <BottomSheet
                className="history-sheet"
                bodyScrollTop={historyScrollTop.current}
                onBodyScroll={(event) => {
                  historyScrollTop.current = event.detail.scrollTop;
                }}
                header={
                  <View className="profile-heading">
                    <Text className="section-title">我的成绩记录</Text>
                    <Button
                      className="text-action"
                      onClick={() => setHistoryOpen(false)}
                    >
                      关闭
                    </Button>
                  </View>
                }
              >
                <View className="history-panel">
                  {busy && <LoadStatus label="正在更新记录" compact />}
                  {!detail.myEntries.length && (
                    <Text className="description">你还没有记过成绩。</Text>
                  )}
                  {detail.myEntries.map((entry) => (
                    <View className="history-row" key={entry.id}>
                      <View className="history-info">
                        <Text className="history-value">
                          {entry.value}
                          <Text className="score-unit">
                            {" "}
                            {detail.template.unit}
                          </Text>
                        </Text>
                        <Text className="history-date">
                          {formatSubmittedAt(entry.createdAt)}
                          {entry.recordedById ? " · 创建者代填" : ""}
                        </Text>
                      </View>
                      <View className="history-actions">
                        <Button
                          className="text-action"
                          disabled={busy || detail.status !== "open"}
                          onClick={() => {
                            setEditing(entry);
                            setValue(entry.value);
                            setScoreOpen(true);
                          }}
                        >
                          修改
                        </Button>
                        <Button
                          className="text-action"
                          disabled={busy}
                          onClick={() => remove(entry)}
                        >
                          删除
                        </Button>
                      </View>
                    </View>
                  ))}
                  {detail.historyHasMore && (
                    <ActionButton
                      className="text-action history-more"
                      loading={historyLoading}
                      pendingLabel="正在加载记录…"
                      disabled={historyLoading || busy}
                      onClick={moreHistory}
                    >
                      加载更早记录
                    </ActionButton>
                  )}
                </View>
              </BottomSheet>
            )}
            {shareOpen && (
              <BottomSheet className="manage-panel share-panel" header={
                <View className="profile-heading">
                  <Text className="section-title">分享</Text>
                  <Button className="text-action" onClick={() => setShareOpen(false)}>关闭</Button>
                </View>
              }>
                <View className="manage-actions">
                  <Button className="manage-row" openType="share" disabled={busy || refreshing}>
                    <Text>分享榜单</Text><Text className="manage-chevron">›</Text>
                  </Button>
                  {mine && rankShareTitle && <>
                    <Button className="manage-row" openType="share" data-share-kind={RANK_SHARE_KIND} disabled={busy || refreshing}>
                      <View className="manage-row-copy"><Text>分享我的排名</Text><Text className="manage-row-note">{rankShareTitle}</Text></View>
                      <Text className="manage-chevron">›</Text>
                    </Button>
                    <Button className="manage-row" openType="share" data-share-kind={SCORE_SHARE_KIND} disabled={busy || refreshing}>
                      <View className="manage-row-copy"><Text>分享我的成绩</Text><Text className="manage-row-note">{formatScore(mine.score)} {detail.template.unit} · 第 {mine.rank} 名</Text></View>
                      <Text className="manage-chevron">›</Text>
                    </Button>
                  </>}
                </View>
                {rankShareTitle && <>
                  <Text className="share-scope-note">转发后，收到卡片的人能看到卡片上的内容。名次和成绩只属于原群。</Text>
                  <Button className="manage-row share-menu-option" aria-pressed={menuScore === boardId} onClick={() => {
                    const next = menuScore === boardId ? undefined : boardId;
                    setMenuScore(next);
                    onMenuScoreChange?.(next);
                  }}>
                    <Text>右上角分享带我的成绩</Text>
                    <Text className="manage-state">{menuScore === boardId ? "已开启" : "未开启"}</Text>
                  </Button>
                </>}
              </BottomSheet>
            )}
            {manageOpen && (
              <BottomSheet
                className="manage-panel"
                header={
                  <View className="profile-heading">
                    <Text className="section-title">榜单操作</Text>
                    <Button
                      className="text-action"
                      onClick={() => setManageOpen(false)}
                    >
                      关闭
                    </Button>
                  </View>
                }
                footer={
                  <View className="manage-footer">
                    <Button
                      className="text-action"
                      disabled={busy}
                      onClick={report}
                    >
                      举报榜单
                    </Button>
                    {detail.creatorId === detail.myUserId && (
                      <Button
                        className="text-action manage-remove"
                        disabled={busy}
                        onClick={removeBoard}
                      >
                        移除榜单
                      </Button>
                    )}
                  </View>
                }
              >
                {busy && <LoadStatus label="正在处理…" compact />}
                <View className="manage-actions">
                  <Button className="manage-row" onClick={() => {
                    setManageOpen(false);
                    openAppearance();
                  }}>
                    <ProductIcon name="trophy" notebook />
                    <Text>榜单外观</Text>
                    <Text className="manage-chevron">›</Text>
                  </Button>
                  {detail.creatorId === detail.myUserId && detail.status !== "closed" && (
                    <Button className="manage-row" disabled={busy} onClick={() =>
                      act(() => groupApi.status(boardId, detail.status === "open" ? "paused" : "open"))
                    }>
                      <View className={`manage-status-icon ${detail.status === "paused" ? "manage-status-paused" : ""}`}><View /><View /></View>
                      <Text>{detail.status === "open" ? "暂停提交" : "恢复提交"}</Text>
                      <Text className="manage-chevron">›</Text>
                    </Button>
                  )}
                </View>
              </BottomSheet>
            )}
          </>
        )}
      </View>
      <View className={`notebook-dock${turning ? " notebook-dock-turning" : ""}`}>
        <Button className="notebook-turn" ariaLabel={page.index === 0 ? "上一页，目录" : "上一页"}
          hoverClass="notebook-control-pressed" disabled={turnLocked}
          onClick={() => requestTurn(-1)}>‹</Button>
        <Button className="notebook-folio" ariaLabel={`第 ${page.index + 1} 页，共 ${page.directory.length} 页，返回目录`}
          hoverClass="notebook-control-pressed" disabled={sheetShowing.current || turning} onClick={onDirectory}>
          <Text className="notebook-page-number">{folio(page.index)} / {folio(page.directory.length - 1)}</Text>
          <Text>目录</Text>
        </Button>
        <Button className="notebook-turn" ariaLabel="下一页"
          hoverClass="notebook-control-pressed" disabled={turnLocked || page.index === page.directory.length - 1}
          onClick={() => requestTurn(1)}>›</Button>
        {detail?.recommendations ? <Button className="notebook-record"
          disabled={turnLocked} hoverClass="notebook-control-pressed"
          onClick={() => openRecommendations(canRecommendMore ? "recommend" : "manage")}>
          <Text>{detail.status !== "open" ? "我的推荐" : canRecommendMore ? "推荐型号" : "管理推荐"}</Text>
        </Button> : detail?.status === "open" ? <Button className="notebook-record" hoverClass="notebook-control-pressed"
          disabled={turnLocked || detail?.status !== "open"}
          onClick={() => {
            if (!detail || turnLocked) return;
            setEditing(existingSingle);
            if (existingSingle) setValue(existingSingle.value);
            setScoreError("");
            setScoreOpen(true);
          }}>
          <Text>{recordLabel}</Text>
        </Button> : <Text className="notebook-record-state">{detail?.status === "paused" ? "已暂停提交" : detail?.status === "closed" ? "已结束" : ""}</Text>}
        {turning && <View className="notebook-turn-status"><LoadStatus compact label="正在翻页" /></View>}
      </View>
      {detail && (
        <>
          {peopleItem && <RecommendersSheet item={peopleItem} onClose={() => setPeopleItemId("")} />}
          {recommendationMode && !profileOpen && detail.recommendations && <RecommendationSheet
            detail={detail} mode={recommendationMode} busy={busy} error={scoreError}
            query={modelQuery} draft={recommendationDraft}
            onModeChange={mode => {
              if (mode === recommendationMode) return;
              changeRecommendationDraft(null);
              setRecommendationMode(mode);
            }}
            onQueryChange={value => { setModelQuery(value); setRecommendationDraft(null); setScoreError(""); }}
            onDraftChange={changeRecommendationDraft}
            onClose={() => setRecommendationMode(null)}
            onRecommend={recommendModel} onWithdraw={withdrawRecommendation} />}
          {scoreOpen && !profileOpen && (
            <BottomSheet
              className="score-sheet"
              header={
                <View className="profile-heading">
                  <Text className="section-title">
                    {editing ? "修改这次成绩" : "记一笔"}
                  </Text>
                  <Button
                    className="text-action"
                    disabled={busy}
                    onClick={() => {
                      if (editing) {
                        setEditing(null);
                        setValue("");
                      }
                      setScoreOpen(false);
                    }}
                  >
                    关闭
                  </Button>
                </View>
              }
              footer={
                <>
                  {detail.status !== "open" && (
                    <Text className="note">
                      榜单已暂停或结束，暂时不能记成绩。
                    </Text>
                  )}
                  <ActionButton
                    className="action"
                    disabled={busy || detail.status !== "open"}
                    loading={busy}
                    onClick={() => save()}
                  >
                    {busy ? "保存中…" : "保存成绩"}
                  </ActionButton>
                  {editing && (
                    <Button
                      className="text-action"
                      disabled={busy}
                      onClick={() => {
                        setEditing(null);
                        setValue("");
                        setScoreOpen(false);
                      }}
                    >
                      取消修改
                    </Button>
                  )}
                </>
              }
            >
              <View className="entry-main">
                <View className="entry-field score-entry">
                  <Text className="entry-label">成绩</Text>
                  <View
                    className={`entry-value ${value.trim().length > 9 ? "entry-value-long" : ""}`}
                  >
                    <SheetInput
                      type="digit"
                      disabled={busy || detail.status !== "open"}
                      value={value}
                      maxlength={13}
                      placeholder={detail.template.metric}
                      placeholderClass="entry-placeholder"
                      onInput={(event) => {
                        setValue(event.detail.value);
                        setScoreError("");
                      }}
                    />
                    {detail.template.unit && <Text className="entry-unit">{detail.template.unit}</Text>}
                  </View>
                  {scoreError && <Text className="entry-error">{scoreError}</Text>}
                </View>
              </View>
              <View className="entry-person score-signature">
                <Avatar
                  userId={detail.myUserId}
                  version={detail.myProfile?.avatarVersion}
                  name={
                    detail.myProfile?.nickname || mine?.displayName || "我"
                  }
                />
                <Text className="entry-person-name">
                  {detail.myProfile?.nickname || mine?.displayName || "我"}
                </Text>
              </View>

            </BottomSheet>
          )}
          {proxyOpen && detail.creatorId === detail.myUserId && (
            <ProxySheet
              boardId={boardId}
              participants={detail.proxyParticipants || []}
              initialId={proxyInitialId}
              template={detail.template}
              writable={detail.status === "open"}
              onClose={() => setProxyOpen(false)}
              onChanged={async () => {
                const refreshed = await load();
                setProxyOpen(false);
                if (refreshed)
                  Taro.showToast({ title: proxyInitialId ? "代填记录已更新" : "已代填，群友可在榜单认领", icon: "none" });
              }}
            />
          )}
          {themeOpen && (
            <BottomSheet
              className="appearance-sheet"
              header={
                <View className="profile-heading">
                  <Text className="section-title">
                    榜单外观
                  </Text>
                  <Button
                    className="text-action"
                    disabled={themeBusy}
                    onClick={() => setThemeOpen(false)}
                  >
                    关闭
                  </Button>
                </View>
              }
            >
              {detail.creatorId === detail.myUserId ? (
                <>
                  <AppearanceEditor
                    value={{
                      themeId: chosenTheme,
                      accentColor: chosenColor,
                      background: chosenBackground,
                    }}
                    name={detail.template.name}
                    boardId={boardId}
                    busy={themeBusy}
                    saveError={themeError}
                    onApply={(next) => {
                      setChosenTheme(next.themeId);
                      setChosenColor(next.accentColor || null);
                      setChosenBackground(next.background);
                      return saveAppearance(next.themeId, next.background, next.accentColor || null);
                    }}
                  />
                </>
              ) : (
                <Text className="note">
                  {themes.find((item) => item.id === activeTheme)?.name} ·
                  由榜单创建者设置
                </Text>
              )}
            </BottomSheet>
          )}
          {profileOpen && (
            <ProfileSheet
              profile={
                detail.myProfile || {
                  userId: detail.myUserId,
                  nickname: null,
                  avatarVersion: null,
                }
              }
              continuing={continueSubmit}
              submitLabel={profileSubmitLabel}
              onClose={() => {
                setProfileOpen(false);
                setContinueSubmit(false);
                profileContinuation.current = null;
              }}
              onUpdated={updateProfile}
              onSaved={(profile) => {
                updateProfile(profile);
                setProfileOpen(false);
                if (continueSubmit) {
                  const continuation = profileContinuation.current;
                  profileContinuation.current = null;
                  continuation?.(profile);
                } else {
                  Taro.showToast({ title: "资料已保存", icon: "success" });
                }
                setContinueSubmit(false);
              }}
            />
          )}
        </>
      )}
    </PageFrame>
  );
}
