import type { ReactNode } from "react";
import { Button, Image, Text, View } from "@tarojs/components";
import type { GroupRankRow, GroupRankThemeId } from "@mono/types";
import ScoreValue from "./score-value";
import AvatarBadge from "./avatar-badge";
import { themes } from "../lib/theme";
import { formatScore } from "../lib/format-score";
import "./scoreboard.scss";

export function ThemePreview({
  theme,
  name = "我的新排行",
  unit = "",
  compact = false,
}: {
  theme: GroupRankThemeId;
  name?: string;
  unit?: string;
  compact?: boolean;
}) {
  return (
    <View
      className={`theme-preview theme--${theme} ${compact ? "compact" : ""}`}
    >
      <Text className="preview-kicker">主题预览</Text>
      <Text className="preview-name">{name || "我的新排行"}</Text>
      <View className="preview-baseline">
        <Text>{unit ? `记分单位 · ${unit}` : "不设单位"}</Text>
      </View>
    </View>
  );
}
export function ThemeChoices({
  value,
  onChange,
  disabled = false,
}: {
  value: GroupRankThemeId;
  onChange: (id: GroupRankThemeId) => void;
  disabled?: boolean;
}) {
  return (
    <View className="theme-choices">
      {themes.map((theme) => (
        <Button
          key={theme.id}
          className={`theme-choice ${value === theme.id ? "selected" : ""}`}
          disabled={disabled}
          onClick={() => onChange(theme.id)}
        >
          <View className={`theme-swatch swatch-${theme.id}`} />
          <Text>{theme.name}</Text>
          {value === theme.id && <Text className="theme-check">✓</Text>}
        </Button>
      ))}
    </View>
  );
}
export function Podium({
  rows,
  unit,
  renderActions,
}: {
  rows: GroupRankRow[];
  unit: string;
  renderActions?: (row: GroupRankRow) => ReactNode;
}) {
  const leaders = rows.slice(0, 3);
  return (
    <View className={`podium podium-count-${leaders.length}`}>
      {!leaders.length ? (
        <View className="podium-empty">
          <Text className="empty-podium-title">暂无成绩</Text>
          <Text>记下第一条成绩后显示排名。</Text>
        </View>
      ) : (
        leaders.map((row, index) => {
          return (
            <View
              key={row.userId}
              className={`podium-person podium-place-${row.rank <= 3 ? row.rank : "other"} ${index === 0 ? "podium-center" : "podium-side"} ${formatScore(row.score).length >= 6 ? "podium-stacked" : ""}`}
            >
              <View className="street-ticket-main">
                {row.rank === 1 && (
                  <Image
                    className="champion-plaque"
                    src="/assets/championship/champion-plaque.jpg"
                    mode="scaleToFill"
                  />
                )}
                <View className="rank-medallion">
                  {row.rank <= 3 && (
                    <Image
                      className="rank-medallion-art"
                      src={
                        row.rank === 1
                          ? "/assets/championship/rank-gold.png"
                          : `/assets/championship/rank-${row.rank === 2 ? "silver" : "bronze"}.jpg`
                      }
                      mode="aspectFit"
                    />
                  )}
                  <Text className="podium-rank">
                    {row.rank.toString().padStart(2, "0")}
                  </Text>
                </View>
                <AvatarBadge
                  userId={row.userId}
                  version={row.avatarVersion}
                  name={row.displayName}
                  rank={row.rank}
                  featured={row.rank === 1}
                  championship
                />
                <View className="podium-copy">
                  <View className="podium-result">
                    <View className="podium-identity">
                      <Text className="podium-name">{row.displayName}</Text>
                      {row.rank === 1 &&
                        rows.filter((candidate) => candidate.rank === 1)
                          .length > 1 && (
                          <Text className="podium-tie">并列第一</Text>
                        )}
                    </View>
                    <ScoreValue
                      className="podium-score"
                      layout="podium"
                      value={row.score}
                      unit={unit}
                    />
                  </View>
                  {row.pendingClaim && row.rank !== 1 && (
                    <View className="podium-actions">
                      {renderActions ? (
                        renderActions(row)
                      ) : (
                        <Text className="podium-pending">
                          待认领 · 创建者代填
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
              {row.pendingClaim && row.rank === 1 && (
                <View className="podium-actions podium-champion-actions">
                  {renderActions ? (
                    renderActions(row)
                  ) : (
                    <Text className="podium-pending">待认领 · 创建者代填</Text>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}
