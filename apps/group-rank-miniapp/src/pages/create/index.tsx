import { ActionButton, LoadStatus } from "../../components/async-feedback";
import AppearanceEditor from "../../components/appearance-editor";
import ArenaBackground from "../../components/arena-background";
import type { GroupRankBackground } from "@mono/types";
import PageFrame, { readFrameMetrics } from "../../components/page-frame";
import { useRef, useState, type CSSProperties } from "react";
import { Button, Image, Input, Text, View } from "@tarojs/components";
import Taro, {
  useDidHide,
  useDidShow,
  useRouter,
  useShareAppMessage,
} from "@tarojs/taro";
import type { GroupRankDefinition, GroupRankDraftDto } from "@mono/types";
import { groupApi, newRequestId } from "../../lib/api";
import { currentEntry, needsEntryNavigation } from "../../lib/entry";
import { consumeNativeMediaReturn } from "../../lib/native-media";
import { notebookShareCard, rulesShareCard } from "../../lib/share";
import { themeId, templateTheme } from "../../lib/theme";
import { usePageKeyboard } from "../../lib/use-page-keyboard";
import "./index.scss";

export default function Create() {
  const keyboard = usePageKeyboard();
  const params = useRouter().params;
  const templateId = params.template;
  const [definition, setDefinition] = useState<GroupRankDefinition>({
    name: "",
    unit: "",
    entryMode: "multiple",
    aggregate: "max",
    direction: "desc",
    period: "all_time",
    themeId: "volt",
  });
  const single = definition.entryMode === "single";
  const [backgroundSource, setBackgroundSource] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [draft, setDraft] = useState<GroupRankDraftDto | null>(null);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [busy, setBusy] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(!!templateId);
  const [inGroup] = useState(currentEntry().kind !== "lobby");
  const canChooseKind = inGroup && !templateId;
  const [recommendation, setRecommendation] = useState(false);
  const [description, setDescription] = useState("");
  const sequence = useRef(0);
  const initialized = useRef(false);
  const lock = useRef(false);
  const pending = useRef<{
    key: string;
    draftRequest: string;
    boardRequest: string;
    draft?: GroupRankDraftDto;
  } | null>(null);
  useDidShow(() => {
    consumeNativeMediaReturn();
    keyboard.reset();
    if (needsEntryNavigation()) {
      void Taro.reLaunch({ url: "/pages/index/index" });
      return;
    }
    if (initialized.current) return;
    initialized.current = true;
    const current = sequence.current;
    if (templateId)
      void groupApi
        .templates()
        .then((items) => {
          if (current !== sequence.current) return;
          const item = items.find((candidate) => candidate.id === templateId);
          if (item)
            setDefinition({
              name: item.name,
              unit: item.unit,
              entryMode: item.entryMode || "multiple",
              aggregate: item.aggregate,
              direction: item.direction,
              period: item.period,
              themeId: templateTheme(item),
              accentColor: item.accentColor || null,
            });
        })
        .catch(() => {
          if (current === sequence.current)
            setError("示例没有加载成功，你也可以直接填写。");
        })
        .finally(() => {
          if (current === sequence.current) setPrefillLoading(false);
        });
  });
  useDidHide(() => {
    keyboard.reset();
    sequence.current += 1;
    if (prefillLoading) initialized.current = false;
  });
  useShareAppMessage(() => draft ? rulesShareCard("draft", draft.id) : notebookShareCard());
  function change<K extends keyof GroupRankDefinition>(
    key: K,
    value: GroupRankDefinition[K],
  ) {
    setDefinition((previous) => ({ ...previous, [key]: value }));
    setDraft(null);
    setError("");
    if (key === "name") setNameError("");
  }
  async function save() {
    if (lock.current) return;
    const { entryMode, ...rules } = definition;
    const data = {
      ...rules,
      ...(entryMode === "single" ? { entryMode, aggregate: "latest" as const } : {}),
      name: definition.name.trim(),
      unit: definition.unit.trim(),
    };
    if (!data.name) {
      setNameError("给榜单起个名字");
      return;
    }
    // Keep the action in place until the tap reaches this handler, then dismiss.
    void Taro.hideKeyboard?.().catch(() => {});
    keyboard.reset();
    setNameError("");
    lock.current = true;
    setBusy(true);
    setError("");
    const current = sequence.current;
    const recommendationData = { name: data.name, description: description.trim() };
    const key = JSON.stringify(recommendation ? recommendationData : data);
    if (pending.current?.key !== key)
      pending.current = {
        key,
        draftRequest: newRequestId(),
        boardRequest: newRequestId(),
      };
    const operation = pending.current;
    try {
      if (recommendation) {
        const board = await groupApi.createRecommendationBoard(recommendationData, operation.boardRequest);
        if (current === sequence.current)
          await Taro.redirectTo({ url: `/pages/board/index?id=${encodeURIComponent(board.id)}` });
        return;
      }
      const saved =
        operation.draft ||
        (await groupApi.createDraft(data, operation.draftRequest));
      if (current !== sequence.current) return;
      if (single && saved.template.entryMode !== "single") {
        throw new Error("暂时无法保存单笔规则，请稍后重试");
      }
      operation.draft = saved;
      if (inGroup) {
        const board = await groupApi.createDraftBoard(
          saved.id,
          operation.boardRequest,
        );
        if (current !== sequence.current) return;
        await Taro.redirectTo({
          url: `/pages/board/index?id=${encodeURIComponent(board.id)}`,
        });
      } else {
        setDraft(saved);
        Taro.nextTick(() => Taro.pageScrollTo({ scrollTop: 0, duration: 0 }));
      }
    } catch (reason) {
      if (current === sequence.current)
        setError(reason instanceof Error ? reason.message : "保存失败，请重试");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const periodLabel = definition.period === "month" ? "每月重新开始" : "长期记录";
  const rulesSummary = [
    single ? "每人一笔" : "允许多笔",
    !single && (definition.aggregate === "sum" ? "累计" : definition.aggregate === "latest" ? "取最新" : "取最高"),
    definition.direction === "asc" ? "低分在前" : "高分在前",
    periodLabel,
  ].filter(Boolean).join(" · ");

  if (draft) {
    const card = rulesShareCard("draft", draft.id);
    const edit = () => setDraft(null);
    return (
      <PageFrame className="create-screen theme--volt" title="发到群里" header={
        <Button className="create-back" ariaLabel="返回编辑" onClick={edit}>‹</Button>
      }>
        <View className="share-ready-page">
          <View className="share-ready-page-sheet">
            <Text className="share-ready-title">规则存好了</Text>
            <Text className="share-ready-name">{draft.template.name}</Text>
            <View className="share-ready-card">
              <View className="share-ready-card-copy">
                <Text className="share-ready-card-label">发出去的卡片</Text>
                <Text className="share-ready-card-title">{card.title}</Text>
              </View>
              <Image className="share-ready-card-image" src={card.imageUrl} mode="aspectFit" aria-hidden />
            </View>
            <Text className="share-ready-tip">回群打开这张卡片，点「在本群创建」。</Text>
            <Button className="action share-ready-send" openType="share" hoverClass="arena-control-pressed" hoverStartTime={0} hoverStayTime={80}>
              发到微信群
            </Button>
            <Button className="share-ready-edit" onClick={edit} hoverClass="directory-link-pressed" hoverStartTime={0} hoverStayTime={60}>
              返回修改规则
            </Button>
            <Text className="share-ready-expiry">规则保存后 7 天内可用</Text>
          </View>
        </View>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      accentColor={definition.accentColor}
      className={`create-screen theme--${themeId(definition.themeId)} ${keyboard.open ? "create-keyboard-open" : ""}`}
      title="新建榜单"
      header={
        <View className="create-heading">
          <Button className="create-back" disabled={busy} onClick={() => Taro.navigateBack()}>
            ‹
          </Button>
        </View>
      }
    >
      <View
        className="page create-page"
        style={
          { "--create-keyboard-inset": `${keyboard.inset}px` } as CSSProperties
        }
      >
        {prefillLoading && <LoadStatus label="正在加载示例规则" compact />}
        <View className="create-editor">
        {inGroup && <Text className="create-scope">创建后出现在本群目录</Text>}
        {canChooseKind && <View className="rule-options create-kind-options">
          {([["成绩榜", false], ["好物推荐榜", true]] as const).map(([label, isRecommendation]) => {
            const selected = recommendation === isRecommendation;
            return <Button key={label} className={`rule-option ${selected ? "chosen" : ""}`}
              aria-pressed={selected} disabled={busy} onClick={() => {
                setRecommendation(isRecommendation);
                setError("");
                setAppearanceOpen(false);
              }}>{label}</Button>;
          })}
        </View>}
        <View className="definition-fields">
          <View className="entry-field name-field">
            <Text className="entry-label">榜单名称</Text>
            <Input
              className="entry-control name-input"
              cursorSpacing={96}
              holdKeyboard
              value={definition.name}
              maxlength={24}
              placeholder={recommendation ? "例如：鼠标推荐榜" : "榜单名称"}
              disabled={busy || prefillLoading}
              onInput={(event) => change("name", event.detail.value)}
            />
            {nameError && <Text className="entry-error">{nameError}</Text>}
          </View>
          {recommendation ? <View className="unit-field entry-field">
            <Text className="entry-label">简介</Text>
            <Input className="entry-control" cursorSpacing={96} holdKeyboard
              value={description} maxlength={120} placeholder="选填" disabled={busy}
              onInput={(event) => { setDescription(event.detail.value); setError(""); }} />
          </View> : <View className="unit-field entry-field">
            <Text className="entry-label">
              单位
            </Text>
            <Input
              className="entry-control"
              cursorSpacing={96}
              holdKeyboard
              value={definition.unit}
              maxlength={12}
              placeholder="选填"
              disabled={busy || prefillLoading}
              onInput={(event) => change("unit", event.detail.value)}
            />
          </View>}
        </View>
        {recommendation ? <Text className="create-setting-label">每人最多推荐 5 个型号，按推荐人数排名，同票并列。</Text> : <>
        <View className="definition-rules">
          <Button className="rules-toggle" disabled={busy || prefillLoading} ariaLabel={rulesOpen ? "收起计分规则" : "展开计分规则"} onClick={() => setRulesOpen(!rulesOpen)}>
            <View className="rules-heading"><Text className="create-setting-label">计分规则</Text><Text className="rules-summary">{rulesSummary}</Text></View>
            <Text className="create-chevron">{rulesOpen ? "⌄" : "›"}</Text>
          </Button>
          {rulesOpen && <View className="rules-content">
            <View className="rule-setting">
              <Text className="rule-setting-label">记录方式</Text>
              <View className="rule-options">
                {([["multiple", "允许多笔"], ["single", "每人一笔"]] as const).map(
                  ([key, label]) => (
                    <Button
                      key={key}
                      className={`rule-option ${(definition.entryMode || "multiple") === key ? "chosen" : ""}`}
                      disabled={busy || prefillLoading}
                      onClick={() => change("entryMode", key)}
                    >
                      {label}
                    </Button>
                  ),
                )}
              </View>
            </View>
            {single ? (
              <Text className="note">提交后可修改原记录。</Text>
            ) : (
              <View className="rule-setting">
                <Text className="rule-setting-label">取值方式</Text>
                <View className="rule-options">
                  {([
                    ["max", "取最高"],
                    ["latest", "取最新"],
                    ["sum", "累计"],
                  ] as const).map(([key, label]) => (
                    <Button
                      key={key}
                      className={`rule-option ${definition.aggregate === key ? "chosen" : ""}`}
                      disabled={busy || prefillLoading}
                      onClick={() => change("aggregate", key)}
                    >
                      {label}
                    </Button>
                  ))}
                </View>
              </View>
            )}
              <View className="rule-setting"><Text className="rule-setting-label">排名规则</Text>
              <View className="rule-options">
                {(
                  [
                    ["desc", "高分在前"],
                    ["asc", "低分在前"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    className={`rule-option ${definition.direction === key ? "chosen" : ""}`}
                    disabled={busy || prefillLoading}
                    onClick={() => change("direction", key)}
                  >
                    {label}
                  </Button>
                ))}
              </View>
              </View>
            <View className="rule-setting">
              <Text className="rule-setting-label">周期</Text>
              <View className="rule-options">
                {(
                  [
                    ["all_time", "长期记录"],
                    ["month", "每月重新开始"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    className={`rule-option ${definition.period === key ? "chosen" : ""}`}
                    disabled={busy || prefillLoading}
                    onClick={() => change("period", key)}
                  >
                    {label}
                  </Button>
                ))}
              </View>
            </View>
            {definition.period === "month" && <Text className="note">按北京时间每月重新开始。</Text>}
          </View>}
        </View>
        <View className="appearance-options">
          <Button
            className="appearance-toggle"
            disabled={busy || prefillLoading}
            onClick={() => {
              const open = !appearanceOpen;
              setAppearanceOpen(open);
              if (open) Taro.nextTick(() => {
                const frame = readFrameMetrics() as Record<string, string>;
                void Taro.pageScrollTo({ selector: "#create-background-editor", offsetTop: -(parseFloat(frame["--page-status-height"]) + parseFloat(frame["--page-header-height"])), duration: 200 });
              });
            }}
          >
            <View className="appearance-entry-copy"><Text>榜单外观</Text><Text className="appearance-entry-hint">{definition.background ? "自定义背景 · 可调整配色" : "挑选背景和配色"}</Text></View>
            <View className="appearance-current">
              <View className="appearance-thumbnail"><ArenaBackground theme={themeId(definition.themeId)} background={definition.background as GroupRankBackground | null} source={backgroundSource} slot="card" dim={false} /></View>
              <Text>{appearanceOpen ? "⌄" : "›"}</Text>
            </View>
          </Button>
          {appearanceOpen && (
            <View id="create-background-editor"><AppearanceEditor
              docked
              value={{
                themeId: themeId(definition.themeId),
                accentColor: definition.accentColor,
                background: (definition.background ||
                  null) as GroupRankBackground | null,
                localSource: backgroundSource,
              }}
              name={definition.name}
              busy={busy || prefillLoading}
              onApply={(next) => {
                setDefinition((p) => ({
                  ...p,
                  themeId: next.themeId,
                  accentColor: next.accentColor,
                  background: next.background,
                }));
                setBackgroundSource(next.localSource || "");
                setDraft(null);
                setError("");
                setAppearanceOpen(false);
              }}
            /></View>
          )}
        </View>
        </>}
        {error && <Text className="form-error">{error}</Text>}
        {!appearanceOpen && (
          <View className="create-dock">
            <ActionButton
              className="action"
              disabled={busy || prefillLoading}
              loading={busy}
              pendingLabel={inGroup ? "正在创建榜单…" : "正在保存规则…"}
              onClick={save}
            >
              <Text>{inGroup ? "创建榜单" : "保存并继续"}</Text>
            </ActionButton>
          </View>
        )}
        </View>
      </View>
    </PageFrame>
  );
}
