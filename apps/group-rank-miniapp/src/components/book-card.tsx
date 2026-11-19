import type { ReactNode } from "react";
import { paletteStyle } from "../lib/palette";
import { Button, Text, View } from "@tarojs/components";
import type { GroupRankBackground, GroupRankBoardDto, GroupRankThemeId } from "@mono/types";
import ArenaBackground from "./arena-background";
import { formatScore } from "../lib/format-score";
import { themeId } from "../lib/theme";
import "./book-card.scss";

export function DirectoryRow({
  title,
  theme,
  accent,
  boardId,
  background,
  pageNumber,
  score,
  unit,
  children,
  onOpen,
}: {
  title: string;
  theme: GroupRankThemeId;
  accent?: string | null;
  boardId?: string;
  background?: GroupRankBackground | null;
  pageNumber?: string;
  score?: string;
  unit?: string;
  children: ReactNode;
  onOpen: () => void;
}) {
  return (
    <Button
      hoverClass="arena-control-pressed"
      hoverStartTime={0}
      hoverStayTime={80}
      className={`directory-row theme--${theme}`}
      style={paletteStyle(accent)}
      onClick={onOpen}
    >
      <View className={`directory-row-folio${background || !boardId ? " directory-row-illustrated" : ""}`}>
        {(background || !boardId) && <View className="directory-row-art">
          <ArenaBackground theme={theme} boardId={boardId} background={background} slot="card" />
        </View>}
        {pageNumber && <Text className="directory-folio-number">{pageNumber}</Text>}
      </View>
      <View className="directory-row-copy">
        <Text className="directory-row-name">{title}</Text>
        <View className="directory-row-result">{children}</View>
      </View>
      {score !== undefined && <View className="directory-row-score">
        <Text className={`directory-score-value${score.length > 7 ? " directory-score-long" : ""}`}>{score}</Text>
        {unit && <Text className="directory-score-unit">{unit}</Text>}
      </View>}
      <View className="directory-row-arrow" aria-hidden />
    </Button>
  );
}

export default function BookCard({
  board,
  pageNumber,
  onOpen,
}: {
  board: GroupRankBoardDto;
  pageNumber?: string;
  onOpen: () => void;
}) {
  const first = board.summary?.leaders[0];
  const winnerCount = board.summary?.winnerCount || 0;
  return (
    <DirectoryRow
      title={board.template.name}
      theme={themeId(board.themeId)}
      accent={board.accentColor}
      boardId={board.id}
      background={board.background}
      pageNumber={pageNumber}
      score={first ? formatScore(first.score) : undefined}
      unit={board.template.unit}
      onOpen={onOpen}
    >
      {first ? (
        <Text className="directory-row-leader">
          {first.displayName}{winnerCount > 1 ? `等 ${winnerCount} 位并列第一` : ""}
        </Text>
      ) : (
        <Text>{board.summary ? "还没有成绩" : "打开查看榜单"}</Text>
      )}
    </DirectoryRow>
  );
}
