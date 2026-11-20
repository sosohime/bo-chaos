import { Button, Text, View } from "@tarojs/components";
import type { GroupRankBoardDetail, GroupRankRow } from "@mono/types";
import type { CSSProperties } from "react";
import BoardRanking from "./board-ranking";
import { paletteStyle } from "../lib/palette";
import { themeId } from "../lib/theme";
import { useViewport } from "../lib/viewport";

const rowLabels = {
  pending: "待认领",
  proxy: "查看记录",
  claim: "这是我",
};

export function rankRowState(detail: GroupRankBoardDetail, row: GroupRankRow) {
  if (!row.pendingClaim) return;
  if (!row.participantId) return "pending";
  if (detail.creatorId === detail.myUserId) return "proxy";
  return "claim";
}

type PaperActions = {
  onRules: () => void;
  onMore: () => void;
  onShare: () => void;
  onProxy?: () => void;
  onHistory: () => void;
  onProfile: () => void;
  onRankAction: (row: GroupRankRow) => (() => void) | undefined;
};

export default function BoardPaper({ detail, actions, busy = false }: {
  detail: GroupRankBoardDetail;
  actions?: PaperActions;
  busy?: boolean;
}) {
  const viewport = useViewport();
  const readerHeight = Math.max(0, viewport.height - viewport.status - viewport.header);
  const previewRows = actions ? undefined : Math.max(10, Math.ceil(readerHeight / (51 * viewport.scale)));
  const showHistory = detail.myEntries.length > 0 || detail.historyHasMore;

  return <View
    className={`notebook-leaf theme--${themeId(detail.themeId)}`}
    style={{ ...paletteStyle(detail.accentColor), "--reader-height": `${readerHeight}px` } as CSSProperties}
    aria-hidden={!actions}
  >
    <BoardRanking
      detail={detail}
      width={viewport.canvas}
      visibleRows={previewRows}
      busy={busy}
      interaction={row => {
        const state = rankRowState(detail, row);
        return {
          label: state ? rowLabels[state] : "",
          actionable: state === "proxy" || state === "claim",
          claim: state === "claim",
          run: actions?.onRankAction(row),
        };
      }}
      onRules={actions?.onRules}
      onMore={actions?.onMore}
      onShare={actions?.onShare}
      onProxy={actions?.onProxy}
    />
    <View className="notebook-own">
      {showHistory && <Button
        className="notebook-history-link"
        ariaLabel="我的成绩记录"
        disabled={busy}
        hoverClass="notebook-control-pressed"
        onClick={actions?.onHistory}
      >
        <Text>我的记录</Text><Text aria-hidden>›</Text>
      </Button>}
      <Button className="notebook-profile-link" disabled={busy} onClick={actions?.onProfile}>头像昵称</Button>
    </View>
    <View className="notebook-leaf-rest" aria-hidden />
  </View>;
}
