import { Button, Text, View } from "@tarojs/components";
import type { GroupRankBoardDetail, GroupRankProfile, GroupRankRecommendationRow } from "@mono/types";
import Avatar from "./avatar";
import { ActionButton } from "./async-feedback";
import BottomSheet, { SheetInput } from "./bottom-sheet";

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
        <Text>{nameOf(person)}</Text>
      </View>)}
    </View>
  </BottomSheet>;
}

export function RecommendationSheet({ detail, recommendations, manageFirst, busy, error, query, onQueryChange, onClose, onRecommend, onWithdraw }: {
  detail: GroupRankBoardDetail;
  recommendations: NonNullable<GroupRankBoardDetail["recommendations"]>;
  manageFirst: boolean;
  busy: boolean;
  error: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onRecommend: (model: string) => void;
  onWithdraw: (item: GroupRankRecommendationRow) => void;
}) {
  const mine = myRecommendations(detail);
  const { items, limit } = recommendations;
  const key = recommendationSearchKey(query);
  const matches = key ? items.filter(item => recommendationSearchKey(item.model).includes(key)) : items;
  const exact = !!key && matches.some(item => recommendationSearchKey(item.model) === key);
  const canRecommend = detail.status === "open" && mine.length < limit;
  const ownList = mine.length > 0 && <View className="recommendation-own-list">
    {mine.map(item => <View className="recommendation-sheet-row" key={item.id}>
      <Text className="recommendation-model">{item.model}</Text>
      <Button className="text-action" disabled={busy} ariaLabel={`撤回 ${item.model}`}
        onClick={() => onWithdraw(item)}>撤回</Button>
    </View>)}
  </View>;
  return <BottomSheet className="recommendation-sheet" header={<View className="profile-heading">
    <Text className="section-title">我的推荐 {mine.length}/{limit}</Text>
    <Button className="text-action" disabled={busy} onClick={onClose}>关闭</Button>
  </View>} footer={canRecommend && !!key && !exact ? <ActionButton className="action"
    disabled={busy} loading={busy} onClick={() => onRecommend(query.trim())}>新增并推荐</ActionButton> : undefined}>
    {error && <Text className="form-error">{error}</Text>}
    {manageFirst && ownList}
    {canRecommend && <View className="entry-field">
      <Text className="entry-label">品牌和型号</Text>
      <SheetInput className="entry-control" value={query} maxlength={80} disabled={busy}
        placeholder="搜索或输入型号" onInput={event => onQueryChange(event.detail.value)} />
    </View>}
    {detail.status !== "open" && <Text className="note">榜单已暂停或结束，仍可撤回自己的推荐。</Text>}
    {detail.status === "open" && !canRecommend && <Text className="note">推荐名额已满，撤回一个型号后可以继续。</Text>}
    {canRecommend && matches.map(item => {
      const recommended = mine.some(row => row.id === item.id);
      return <View className="recommendation-sheet-row" key={item.id}>
        <Text className="recommendation-model">{item.model}</Text>
        {recommended ? <Text className="note">已推荐</Text> : <Button className="text-action" disabled={busy}
          ariaLabel={`推荐 ${item.model}`} onClick={() => onRecommend(item.model)}>推荐</Button>}
      </View>;
    })}
    {!manageFirst && ownList}
  </BottomSheet>;
}
