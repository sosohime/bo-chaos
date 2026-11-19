import type { CSSProperties } from "react";
import { Text, View } from "@tarojs/components";
import { formatScore } from "../lib/format-score";
import "./score-value.scss";

export default function ScoreValue({
  value,
  unit,
  layout,
  className = "",
}: {
  value: string;
  unit: string;
  layout: "podium" | "standing" | "row" | "card";
  className?: string;
}) {
  const displayValue = formatScore(value);
  const compactAt = { podium: 7, standing: 7, row: 7, card: 6 };
  const compact = displayValue.length >= compactAt[layout];
  return (
    <View
      className={`score-value score-layout-${layout} ${compact ? "score-compact" : ""} ${className}`}
      style={
        {
          "--score-scale": Math.min(1, 13 / Math.max(1, displayValue.length)),
        } as CSSProperties
      }
    >
      <Text className="score-number" style={{ whiteSpace: "nowrap" }}>
        {displayValue}
      </Text>
      {unit && (
        <Text className="score-value-unit">{compact ? unit : ` ${unit}`}</Text>
      )}
    </View>
  );
}
