import { ActionButton, PageSkeleton } from "../../components/async-feedback";
import PageFrame from "../../components/page-frame";
import BrandMark from "../../components/brand-mark";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Text, View } from "@tarojs/components";
import Taro, { useDidHide, useDidShow, usePageScroll, useShareAppMessage } from "@tarojs/taro";
import type {
  GroupRankSpaceDto,
  GroupRankBoardDetail,
  GroupRankTemplate,
  GroupRankDraftDto,
} from "@mono/types";
import {
  currentGroupGeneration,
  GroupContextUnavailableError,
  groupApi,
  newRequestId,
} from "../../lib/api";
import { boardShareWithArt, draftShareWithArt, findSharedTemplate, notebookShareCard, rulesShareCard, shareSelection } from "../../lib/share";
import {
  consumeEntryNavigation,
  currentEntry,
  groupHomeTarget,
} from "../../lib/entry";
import type { EntryIntent } from "../../lib/entry";
import { showGroupReturnHelp } from "../../lib/return-guide";
import { DirectoryRow } from "../../components/book-card";
import { DirectoryExamplesToggle, DirectoryHeading, DirectoryIndex } from "../../components/directory-paper-preview";
import { templateTheme } from "../../lib/theme";
import { folio } from "../../lib/notebook";
import { usePageTurn } from "../../lib/use-page-turn";
import NotebookSheet from "../../components/page-corner";
import BoardPaper from "../../components/board-paper";
import { createBoardWarmup } from "../../lib/board-warmup";
import { consumeNativeMediaReturn } from "../../lib/native-media";
import { NotebookReader, type ReaderPage } from "../../features/notebook-reader";
import "./index.scss";

function WelcomeCover({ title, description }: { title: string; description: string }) {
  return (
    <View className="welcome-cover">
      <View className="welcome-intro">
        <Text className="welcome-title">{title}</Text>
        <Text className="welcome-description">{description}</Text>
      </View>
      <Image className="welcome-photo" src="/assets/brand/boge-writing.jpg" mode="aspectFill" aria-hidden />
    </View>
  );
}

function WelcomePage({ onCreate }: { onCreate: () => void }) {
  return (
    <>
      <WelcomeCover title="每群一小本" description="榜单和成绩按微信群分开记。" />
      <View className="welcome-actions">
        <View className="welcome-start">
          <Text className="welcome-instruction">把卡片发到想用的群，再从群里点开。</Text>
          <Button className="group-create welcome-primary" openType="share" hoverClass="arena-control-pressed" hoverStartTime={0} hoverStayTime={80}>
            <Text>发到微信群</Text>
            <View className="directory-row-arrow" aria-hidden />
          </Button>
        </View>
        <Button className="welcome-return" hoverClass="directory-link-pressed" hoverStartTime={0} hoverStayTime={60} onClick={() => showGroupReturnHelp()}>
          <View className="welcome-return-copy">
            <Text className="welcome-return-title">已有榜单？</Text>
            <Text className="welcome-return-detail">回原来的群，点小本儿卡片。</Text>
          </View>
          <View className="directory-row-arrow" aria-hidden />
        </Button>
        <Button className="welcome-create" hoverClass="directory-link-pressed" hoverStartTime={0} hoverStayTime={60} onClick={onCreate}>
          <Text>先设计榜单</Text>
          <View className="directory-row-arrow" aria-hidden />
        </Button>
      </View>
    </>
  );
}

export default function Home() {
  const [group, setGroup] = useState<GroupRankSpaceDto | null>(null);
  const [reader, setReader] = useState<ReaderPage | null>(null);
  const [firstDetail, setFirstDetail] = useState<GroupRankBoardDetail | null>(null);
  const readerShare = useRef<GroupRankBoardDetail | null>(null);
  const menuScoreBoard = useRef<string>();
  const [templates, setTemplates] = useState<GroupRankTemplate[]>([]);
  const [sharedId, setSharedId] = useState("");
  const [sharedDraft, setSharedDraft] = useState<GroupRankDraftDto | null>(
    null,
  );
  const [draftError, setDraftError] = useState("");
  const [unmatchedBoard, setUnmatchedBoard] = useState<"board" | "result">();
  const [error, setError] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [entryKind, setEntryKind] = useState(currentEntry().kind);
  const [showPlays, setShowPlays] = useState(false);
  const entryIntent = useRef<EntryIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const templatesReady = useRef(false);
  const templatesFetching = useRef(false);
  const [creating, setCreating] = useState<string | null>(null);
  const sequence = useRef(0);
  const pendingCreate = useRef<{
    templateId: string;
    requestId: string;
  } | null>(null);
  const busy = useRef(false);
  const opening = useRef<number>();
  const [turning, setTurning] = useState(false);
  const groupGeneration = useRef<number>();
  const [warmup] = useState(() => createBoardWarmup(groupApi.board, currentGroupGeneration));
  const scrollOffset = useRef(0);
  usePageScroll(({ scrollTop }) => { scrollOffset.current = scrollTop; });
  const isLobby = entryKind === "lobby";
  const groupReady = !isLobby && !!group && !loading;
  const firstPage = groupReady && !group.boards.length;
  const sharedTemplate = findSharedTemplate(templates, sharedId);
  const waitingForRules = !!sharedId && templatesLoading;
  const existing =
    group?.boards.filter((board) => board.template.id === sharedTemplate?.id) || [];

  async function loadGroup(current: number, keepDirectory = false) {
    if (!keepDirectory) setGroup(null);
    setError("");
    if (!keepDirectory) setLoading(true);
    try {
      const space = await groupApi.currentGroup();
      if (sequence.current !== current) return;
      groupGeneration.current = currentGroupGeneration();
      setGroup(space);
      const intent = entryIntent.current;
      const target = intent ? groupHomeTarget(space.boards, intent) : undefined;
      if (!keepDirectory) setUnmatchedBoard(intent?.boardId && !target ? (intent.personalResult ? "result" : "board") : undefined);
      if (target) {
        entryIntent.current = null;
        await openBoard(target, space.boards);
      } else if (intent?.draftId) {
        setDraftError("");
        try {
          const draft = await groupApi.draft(intent.draftId);
          if (sequence.current === current) setSharedDraft(draft);
        } catch (reason) {
          if (sequence.current === current)
            setDraftError(
              reason instanceof Error
                ? reason.message
                : "分享的规则加载失败，请重试",
            );
        }
      }
    } catch (reason) {
      if (sequence.current !== current) return;
      setGroup(null);
      if (reason instanceof GroupContextUnavailableError)
        setError("请从本群的小程序卡片或群工具重新打开。");
      else
        setError(
          reason instanceof Error ? reason.message : "暂时无法进入，请稍后重试",
        );
    } finally {
      if (sequence.current === current) setLoading(false);
    }
  }

  async function loadTemplates() {
    if (templatesFetching.current) return;
    templatesFetching.current = true;
    setTemplatesLoading(!templatesReady.current);
    setTemplateError("");
    try {
      const items = await groupApi.templates();
      templatesReady.current = true;
      setTemplates(items);
    } catch {
      if (!templatesReady.current) {
        setTemplateError("玩法暂时加载失败");
      }
    } finally {
      templatesFetching.current = false;
      setTemplatesLoading(false);
    }
  }

  useDidShow(() => {
    const entry = currentEntry();
    const isNewEntry = consumeEntryNavigation();
    const keepDirectory = entry.kind !== "lobby" && !isNewEntry && groupGeneration.current === currentGroupGeneration();
    if (reader && !isNewEntry && (consumeNativeMediaReturn() || keepDirectory)) return;
    setReader(null);
    setTurning(false);
    readerShare.current = null;
    menuScoreBoard.current = undefined;
    setEntryKind(entry.kind);
    const current = ++sequence.current;
    if (!keepDirectory) {
      setGroup(null);
      setFirstDetail(null);
    }
    setSharedDraft(null);
    setUnmatchedBoard(undefined);
    setDraftError("");
    setError("");
    if (isNewEntry) {
      entryIntent.current = entry;
      setSharedId(entry.templateId);
      setShowPlays(false);
      pendingCreate.current = null;
    } else {
      // Returning from a board must leave the group home usable, without redirect loops.
      entryIntent.current = null;
      setSharedId("");
    }
    if (entry.kind === "lobby") {
      setLoading(false);
    } else {
      void loadGroup(current, keepDirectory);
    }
    if (isNewEntry || !templatesReady.current) void loadTemplates();
  });
  useDidHide(() => {
    warmup.clear();
    sequence.current += 1;
  });
  useShareAppMessage((event) => {
    if (isLobby) return notebookShareCard();
    const board = readerShare.current;
    if (board) return boardShareWithArt(board, shareSelection(event, menuScoreBoard.current === board.id));
    if (sharedDraft) return draftShareWithArt(sharedDraft);
    if (sharedTemplate) return rulesShareCard("template", sharedTemplate.id);
    return notebookShareCard();
  });

  async function create(templateId: string, isDraft = false) {
    if (busy.current || !group) return;
    busy.current = true;
    setCreating(templateId);
    const current = sequence.current;
    if (pendingCreate.current?.templateId !== templateId)
      pendingCreate.current = { templateId, requestId: newRequestId() };
    try {
      const board = await (
        isDraft ? groupApi.createDraftBoard : groupApi.createBoard
      )(templateId, pendingCreate.current.requestId);
      pendingCreate.current = null;
      if (sequence.current !== current) return;
      await Taro.navigateTo({
        url: `/pages/board/index?id=${encodeURIComponent(board.id)}`,
      });
    } catch (reason) {
      if (sequence.current === current)
        Taro.showToast({
          title: reason instanceof Error ? reason.message : "创建失败",
          icon: "none",
        });
    } finally {
      busy.current = false;
      setCreating(null);
    }
  }

  const newBoard = (templateId?: string) => {
    const query = templateId
      ? `template=${encodeURIComponent(templateId)}`
      : "";
    return Taro.navigateTo({
      url: `/pages/create/index${query ? `?${query}` : ""}`,
    });
  };

  async function openBoard(id: string, boards = group?.boards ?? []) {
    const current = sequence.current;
    const index = boards.findIndex(board => board.id === id);
    if (opening.current === current || index < 0) return;
    opening.current = current;
    const generation = currentGroupGeneration();
    const stillHere = () => current === sequence.current && generation === currentGroupGeneration();
    setTurning(true);
    try {
      const detail = await warmup.read(id);
      if (!stillHere()) return;
      if (detail.id !== id) throw new Error("榜单加载失败");
      readerShare.current = detail;
      setReader({ directory: boards, index, detail });
      Taro.nextTick(() => Taro.pageScrollTo({ scrollTop: 0, duration: 0 }));
    } catch (reason) {
      if (stillHere())
        Taro.showToast({
          title: reason instanceof Error ? reason.message : "暂时无法打开榜单",
          icon: "none",
        });
    } finally {
      if (opening.current === current) {
        opening.current = undefined;
        setTurning(false);
      }
    }
  }

  const firstBoard = group?.boards[0];
  useEffect(() => {
    if (reader || loading || !firstBoard) return;
    return warmup.schedule([firstBoard.id], setFirstDetail);
  }, [reader, firstBoard, loading, warmup]);
  const turnLocked = loading || turning || creating !== null;
  function turnToFirstBoard() {
    if (firstBoard && !turnLocked && !busy.current)
      void openBoard(firstBoard.id);
  }
  const turnEvents = usePageTurn(!firstBoard || turnLocked, scrollOffset, (direction) => {
    if (direction === 1) turnToFirstBoard();
  });

  const directoryPaper = (
    <View className="home-book theme--volt">
      {isLobby && <WelcomePage onCreate={() => newBoard()} />}
      {groupReady && !firstPage && <DirectoryHeading count={group.boards.length} disabled={turning} onCreate={() => newBoard()} />}
      {!isLobby && loading && <PageSkeleton />}
      {error && !loading && (
        <View className="home-state error">
          <Text className="label">暂时无法进入本群</Text>
          <Text className="description">{error}</Text>
          <Button
            className="directory-retry"
            hoverClass="directory-link-pressed"
            onClick={() => loadGroup(sequence.current)}
          >
            重试
          </Button>
        </View>
      )}
      {groupReady && unmatchedBoard && (
        <View className="home-state shared-board-unavailable">
          <Text>{unmatchedBoard === "result" ? "这是原群的成绩卡片。" : "这张榜单不在本群。"}</Text>
          <Text>{unmatchedBoard === "result" ? "名次和成绩不计入本群。请回原群查看。"
            : sharedDraft || sharedTemplate ? "这里只能另建一张榜，原群的成绩不会带过来。"
              : "想看原来的榜单，请在原群打开卡片。"}</Text>
        </View>
      )}
      {groupReady && draftError && (
        <View className="home-state">
          <Text className="description">{draftError}</Text>
          <Button
            className="text-action"
            hoverClass="directory-link-pressed"
            onClick={() => loadGroup(sequence.current)}
          >
            重新加载规则
          </Button>
        </View>
      )}
      {groupReady && sharedDraft && (
        <View className="shared-rules">
          <Text className="home-kicker">群友分享的规则</Text>
          <Text className="shared-title">{sharedDraft.template.name}</Text>
          <Text className="description">
            {sharedDraft.template.description}
          </Text>
          <Text className="note">
            {sharedDraft.template.period === "month"
              ? "每月重新开始"
              : "长期记录"}{" "}
            ·{" "}
            {sharedDraft.template.direction === "asc"
              ? "越低越靠前"
              : "越高越靠前"}
          </Text>
          <ActionButton
            className="action small-action"
            disabled={creating !== null || turning}
            loading={creating === sharedDraft.id}
            pendingLabel="正在创建榜单…"
            onClick={() => create(sharedDraft.id, true)}
          >
            在本群创建
          </ActionButton>
          <Text className="note">只带入规则，成绩从本群重新开始。</Text>
        </View>
      )}
      {groupReady && !sharedDraft && sharedTemplate && (
        <View className="shared-rules">
          <Text className="home-kicker">群友分享的规则</Text>
          <Text className="shared-title">{sharedTemplate.name}</Text>
          <Text className="description">
            {existing.length
              ? "本群已有这个榜单，可以直接参与。"
              : "在本群建个榜单，就能开始记成绩。"}
          </Text>
          {existing.map((board) => (
            <Button
              className="text-action existing-board"
              hoverClass="directory-link-pressed"
              key={board.id}
              onClick={() => openBoard(board.id)}
            >
              {folio(group.boards.indexOf(board))} · {board.template.name} ›
            </Button>
          ))}
          <ActionButton
            className="action small-action"
            disabled={creating !== null || turning}
            loading={creating === sharedTemplate.id}
            pendingLabel="正在创建榜单…"
            onClick={() => create(sharedTemplate.id)}
          >
            {existing.length ? "另建一个榜单" : "在本群创建"}
          </ActionButton>
        </View>
      )}
      {firstPage && !sharedDraft && !sharedTemplate && !waitingForRules && (
        <View className="welcome-actions">
          <WelcomeCover title="本群的小本儿" description="建张榜，和群友一起记成绩。" />
          <Button className="group-create welcome-primary" hoverClass="arena-control-pressed" hoverStartTime={0} hoverStayTime={80} onClick={() => newBoard()}>
            <Text>新建第一张榜</Text>
            <View className="directory-row-arrow" aria-hidden />
          </Button>
        </View>
      )}
      {groupReady && !firstPage && (
        <>
          <DirectoryIndex boards={group.boards} onOpen={openBoard} />
          <DirectoryExamplesToggle expanded={showPlays} onToggle={() => setShowPlays(previous => !previous)} />
        </>
      )}
      {(isLobby || (groupReady && (firstPage || showPlays))) && (
        <View className="home-section">
          {(isLobby || firstPage) && <Text className="welcome-examples-title">用个模板</Text>}
          {templatesLoading && <PageSkeleton />}
          {!templatesLoading && templateError && (
            <View className="home-state">
              <Text>{templateError}</Text>
              <Button
                className="text-action"
                hoverClass="directory-link-pressed"
                onClick={loadTemplates}
              >
                重新加载
              </Button>
            </View>
          )}
          {!templatesLoading && !templateError && !templates.length && (
            <View className="home-state">暂时没有可用的玩法</View>
          )}
          {!!templates.length && (
            <View className="play-list">
              {templates.map((item) => (
                <DirectoryRow
                  key={item.id}
                  title={item.name}
                  theme={templateTheme(item)}
                  onOpen={() => newBoard(item.id)}
                >
                  <Text>{item.metric}{item.unit ? ` · ${item.unit}` : ""}</Text>
                </DirectoryRow>
              ))}
            </View>
          )}
        </View>
      )}
      {groupReady && (
        <View className="home-footer-actions">
          <Button className="text-action group-return-help" hoverClass="directory-link-pressed" hoverStartTime={0} hoverStayTime={60} onClick={() => showGroupReturnHelp()}>
            下次怎么打开？
          </Button>
        </View>
      )}
      {firstBoard && (
        <View className="home-corner-space">
        </View>
      )}
    </View>
  );

  if (reader) return <NotebookReader
    initialPage={reader}
    directoryPaper={directoryPaper}
    onMenuScoreChange={id => { menuScoreBoard.current = id; }}
    onBoardChange={board => { readerShare.current = board; }}
    onDirectory={() => {
      readerShare.current = null;
      menuScoreBoard.current = undefined;
      setReader(null);
      Taro.nextTick(() => Taro.pageScrollTo({ scrollTop: 0, duration: 0 }));
      void loadGroup(++sequence.current, true);
    }}
  />;

  return (
    <PageFrame
      className={`home theme--volt ${isLobby ? "home-lobby" : "home-group"}`}
      nativeTitle={firstPage ? "本群的小本儿" : groupReady ? "目录" : "博哥的小本儿"}
      header={<BrandMark compact />}
    >
      <View className={`home-content ${firstBoard ? "home-content-turnable" : ""}`} {...turnEvents}>
        <NotebookSheet
          label={firstBoard ? "翻到第一页" : ""}
          leafKey={`directory-${group?.boards.length ?? 0}-${showPlays}`}
          disabled={turnLocked}
          onTurn={turnToFirstBoard}
          next={firstDetail && firstDetail.id === firstBoard?.id
            ? <BoardPaper detail={firstDetail} /> : undefined}
        >
          {directoryPaper}
        </NotebookSheet>
      </View>
    </PageFrame>
  );
}
