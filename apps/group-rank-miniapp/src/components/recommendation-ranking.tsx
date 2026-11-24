import { Button, Text, View } from "@tarojs/components";
import type { GroupRankBoardDetail, GroupRankProfile, GroupRankRecommendationRow } from "@mono/types";
import Avatar from "./avatar";
import { ActionButton } from "./async-feedback";
import BottomSheet, { SheetInput, SheetTextarea } from "./bottom-sheet";

export type RecommendationMode = "recommend" | "manage";
export type RecommendationDraft = { model: string; note: string };

function nameOf(person: GroupRankProfile) {
  return person.nickname?.trim() || "群友";
}

export function myRecommendations(detail: GroupRankBoardDetail) {
  return detail.recommendations?.items.filter(item =>
    item.recommenders.some(person => person.userId === detail.myUserId),
  ) || [];
}

export function recommendationSearchKey(model: string) {
  return model.normalize("NFKC").replace(/\s+/gu, "").toLowerCase();
}

export function RecommendationRanking({ items, visibleRows, busy, onPeople }: {
  items: GroupRankRecommendationRow[];
  visibleRows?: number;
  busy: boolean;
  onPeople?: (id: string) => void;
}) {
  if (!items.length) return <View className="rank-empty"><Text>还没有推荐，来推荐第一个型号吧。</Text></View>;
  return <View className="rank-lines recommendation-lines">
    {items.slice(0, visibleRows).map(item => {
      const Group = onPeople ? Button : View;
      return <View className="rank-line recommendation-line" key={item.id}>
        <Text className="rank-number">{String(item.rank).padStart(2, "0")}</Text>
        <View className="recommendation-row-copy">
          <Text className="recommendation-model">{item.model}</Text>
          <Group className="recommendation-people" {...(onPeople ? {
            ariaLabel: `查看 ${item.model} 的推荐人`,
            disabled: busy,
            onClick: () => onPeople(item.id),
          } : {})}>
            <View className="recommendation-avatars" aria-hidden>
              {item.recommenders.slice(0, 3).map(person => <Avatar key={person.userId}
                userId={person.userId} version={person.avatarVersion} name={nameOf(person)} />)}
              {item.recommenders.length > 3 && <Text className="recommendation-more">+{item.recommenders.length - 3}</Text>}
            </View>
            <Text>{item.recommenders.length} 人推荐{onPeople ? " ›" : ""}</Text>
          </Group>
        </View>
      </View>;
    })}
  </View>;
}

export function RecommendersSheet({ item, onClose }: {
  item: GroupRankRecommendationRow;
  onClose: () => void;
}) {
  return <BottomSheet className="recommendation-sheet" header={<View className="profile-heading">
    <Text className="section-title">推荐人 · {item.recommenders.length} 人</Text>
    <Button className="text-action" onClick={onClose}>关闭</Button>
  </View>}>
    <Text className="recommendation-model">{item.model}</Text>
    <View className="recommendation-people-list">
      {item.recommenders.map(person => <View className="recommendation-person" key={person.userId}>
        <Avatar userId={person.userId} version={person.avatarVersion} name={nameOf(person)} />
        <View className="recommendation-person-copy">
          <Text>{nameOf(person)}</Text>
          {person.note && <Text className="recommendation-person-note">{person.note}</Text>}
        </View>
      </View>)}
    </View>
  </BottomSheet>;
}

export function RecommendationSheet({ detail, mode, busy, error, query, draft, onModeChange, onQueryChange, onDraftChange, onClose, onRecommend, onWithdraw }: {
  detail: GroupRankBoardDetail;
  mode: RecommendationMode;
  busy: boolean;
  error: string;
  query: string;
  draft: RecommendationDraft | null;
  onModeChange: (mode: RecommendationMode) => void;
  onQueryChange: (value: string) => void;
  onDraftChange: (draft: RecommendationDraft | null) => void;
  onClose: () => void;
  onRecommend: (draft: RecommendationDraft) => void;
  onWithdraw: (item: GroupRankRecommendationRow) => void;
}) {
  if (!detail.recommendations) return null;
  const mine = myRecommendations(detail);
  const { items, limit } = detail.recommendations;
  const key = recommendationSearchKey(query);
  const matches = key ? items.filter(item => recommendationSearchKey(item.model).includes(key)) : items;
  const exact = !!key && matches.some(item => recommendationSearchKey(item.model) === key);
  const canRecommend = detail.status === "open" && mine.length < limit;
  const activeDraft = mode === "recommend" && canRecommend ? draft : null;
  const ownIds = new Set(mine.map(item => item.id));
  const options = matches.map(({ id, model }) => ({ id, model, isNew: false }));
  if (canRecommend && key && !exact) options.push({ id: "new", model: query.trim(), isNew: true });
  const selectedId = activeDraft && options.find(option => option.model === activeDraft.model && !ownIds.has(option.id))?.id;
  const draftAnchor = selectedId ? `recommendation-draft-${selectedId}` : undefined;

  return <BottomSheet className="recommendation-sheet"
    bodyScrollIntoView={draftAnchor ?? `recommendation-panel-${mode}`}
    header={<>
      <View className="profile-heading">
        <Text className="section-title">推荐型号</Text>
        <Button className="text-action" disabled={busy} onClick={onClose}>关闭</Button>
      </View>
      <View className="recommendation-tabs">
        <Button className={`recommendation-tab${mode === "recommend" ? " recommendation-tab-active" : ""}`} aria-pressed={mode === "recommend"} disabled={busy}
          onClick={() => onModeChange("recommend")}>选型号</Button>
        <Button className={`recommendation-tab${mode === "manage" ? " recommendation-tab-active" : ""}`} aria-pressed={mode === "manage"} disabled={busy}
          onClick={() => onModeChange("manage")}>我的推荐 {mine.length}/{limit}</Button>
      </View>
    </>}>
    <View id={`recommendation-panel-${mode}`}>
      {error && !draftAnchor && <Text className="form-error">{error}</Text>}
      {mode === "manage" ? <View className="recommendation-own-list">
        {!mine.length && <Text className="note">你还没有推荐型号。</Text>}
        {mine.map(item => <View className="recommendation-sheet-row" key={item.id}>
          <Text className="recommendation-model">{item.model}</Text>
          <Button className="text-action" disabled={busy} ariaLabel={`撤回 ${item.model}`}
            onClick={() => onWithdraw(item)}>撤回</Button>
        </View>)}
      </View> : <>
        <View className="entry-field">
          <SheetInput className="entry-control" value={query} maxlength={80} disabled={busy}
            placeholder="搜索或输入型号" onInput={event => onQueryChange(event.detail.value)} />
        </View>
        {detail.status !== "open" && <Text className="note">榜单已暂停或结束，仍可撤回自己的推荐。</Text>}
        {detail.status === "open" && !canRecommend && <Text className="note">推荐名额已满，撤回一个型号后可以继续。</Text>}
        {!options.length && <Text className="note">{key ? "没有匹配的型号。" : "还没有推荐型号。"}</Text>}
        {options.map(({ id, model, isNew }) => {
          const selected = id === selectedId ? activeDraft : null;
          const action = isNew ? "新增并推荐" : "推荐";
          return <View key={id} id={selected ? draftAnchor : undefined}>
            <View className="recommendation-sheet-row">
              <Text className="recommendation-model">{model}</Text>
              {ownIds.has(id) ? <Text className="recommendation-selected">✓ 已推荐</Text> : selected ? (
                <Button className="text-action" disabled={busy} onClick={() => onDraftChange(null)}>取消</Button>
              ) : canRecommend && <Button className="text-action" disabled={busy} ariaLabel={`${action} ${model}`}
                onClick={() => onDraftChange({ model, note: "" })}>{action}</Button>}
            </View>
            {selected && <View className="recommendation-composer">
              <Text className="entry-label">使用感受（选填）</Text>
              <SheetTextarea className="recommendation-note-field" value={selected.note} maxlength={120} disabled={busy}
                ariaLabel="使用感受（选填）" placeholder="说说实际用起来怎么样"
                onInput={event => onDraftChange({ ...selected, note: event.detail.value })} />
              {error && <Text className="form-error">{error}</Text>}
              <ActionButton className="action" disabled={busy} loading={busy} onClick={() => onRecommend(selected)}>确认推荐</ActionButton>
            </View>}
          </View>;
        })}
      </>}
    </View>
  </BottomSheet>;
}
