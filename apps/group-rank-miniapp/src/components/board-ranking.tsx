import { Button, Image, Text, View } from "@tarojs/components";
import type { GroupRankBoardDetail, GroupRankRow } from "@mono/types";
import Avatar from "./avatar";
import { RecommendationRanking } from "./recommendation-ranking";
import TitleArtwork from "./title-artwork";
import ArenaBackground from "./arena-background";
import GroupName from "./group-name";
import { formatScore } from "../lib/format-score";
import { crownForRank } from "../lib/theme";
import { arenaLayout } from "../lib/arena-layout";
import "./board-ranking.scss";

export type RankInteraction = { label: string; actionable?: boolean; claim?: boolean; run?: () => void };

export default function BoardRanking({
  detail,
  width,
  visibleRows,
  busy,
  interaction,
  onRules,
  onMore,
  onShare,
  onProxy,
  onPeople,
}: {
  detail: GroupRankBoardDetail;
  width: number;
  visibleRows?: number;
  busy: boolean;
  interaction: (row: GroupRankRow) => RankInteraction;
  onRules?: () => void;
  onMore?: () => void;
  onShare?: () => void;
  onProxy?: () => void;
  onPeople?: (id: string) => void;
}) {
  const layout = arenaLayout(detail.template.name, width);
  const unit = detail.template.unit;
  const recommendations = detail.recommendations;
  return (
    <>
      <View className="rank-cover">
        <ArenaBackground
          key={`cover-${detail.id}`}
          theme={detail.themeId}
          background={detail.background}
          boardId={detail.id}
          layoutKey={String(width)}
          presetLayout="detail"
        />
        <View className="rank-cover-meta">
          <Text>
            {recommendations ? `${recommendations.items.length} 个型号` : `${detail.ranking.length} 人参与`}
            {detail.status !== "open" && (detail.status === "paused" ? " · 已暂停" : " · 已结束")}
          </Text>
        </View>
        <TitleArtwork
          key={`title-${detail.id}`}
          boardId={detail.id}
          name={detail.template.name}
          maxWidth={Math.round(width - 84 * layout.scale)}
          height={Math.round(47 * layout.scale)}
        />
        <View className="rank-cover-controls">
          <GroupName />
          <Button className="rank-cover-action" onClick={onRules} disabled={busy}>规则</Button>
          <Button className="rank-cover-action" onClick={onMore} disabled={busy}>更多</Button>
        </View>
      </View>
      {onShare && <View className="rank-shortcuts">
        <Button className="rank-cover-action rank-share-action" onClick={onShare} disabled={busy}>分享</Button>
        {onProxy && <Button className="rank-cover-action" onClick={onProxy} disabled={busy}>{detail.status === "open" ? "帮群友记" : "查看代填历史"}</Button>}
      </View>}
      {recommendations && detail.template.description && <Text className="recommendation-description">{detail.template.description}</Text>}
      {recommendations ? <RecommendationRanking items={recommendations.items} visibleRows={visibleRows} busy={busy} onPeople={onPeople} /> : detail.ranking.length ? (
        <View className="rank-lines">
          {detail.ranking.slice(0, visibleRows).map((row, index) => {
            const action = interaction(row);
            const Item = action.actionable || action.run ? Button : View;
            const crown = crownForRank(row.rank);
            const score = formatScore(row.score);
            return (
              <Item
                key={row.participantId || row.userId}
                className={`rank-line${index === 0 ? " rank-lead" : ""}${crown ? ` rank-medal-${row.rank}` : ""}${score.length > 10 ? " rank-line-long" : ""}`}
                {...(Item === Button ? { onClick: action.run, disabled: busy, hoverClass: "notebook-control-pressed" } : {})}
              >
                <Text className="rank-number">{String(row.rank).padStart(2, "0")}</Text>
                <View className={`rank-avatar ${crown ? "rank-avatar-crowned" : ""}`}>
                  <Avatar userId={row.userId} version={row.avatarVersion} name={row.displayName} />
                  {crown && <Image className="rank-crown" src={`/assets/arena/crown-${row.rank === 1 ? "gold" : row.rank === 2 ? "silver" : "bronze"}-v1.png`} mode="aspectFit" />}
                </View>
                <View className="rank-person">
                  <View className="rank-person-identity">
                    <Text className="rank-person-name">{row.displayName}</Text>
                    {row.pendingClaim && <Text className="rank-proxy-badge">代填</Text>}
                  </View>
                  {action.claim ? (
                    <Text className="rank-claim-chip">{action.label} ›</Text>
                  ) : action.label && (
                    <Text className={`rank-person-action${action.actionable ? " rank-person-link" : ""}`}>{action.label}{action.actionable ? " ›" : ""}</Text>
                  )}
                </View>
                <View className="rank-result">
                  <Text className="rank-score">{score}</Text>
                  {unit && <Text className="rank-unit">{unit}</Text>}
                </View>
              </Item>
            );
          })}
        </View>
      ) : (
        <View className="rank-empty">
          <Text>还没有成绩</Text>
        </View>
      )}
    </>
  );
}
