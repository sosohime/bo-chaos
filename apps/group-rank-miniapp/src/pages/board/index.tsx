import { useRef } from "react";
import { useRouter, useShareAppMessage } from "@tarojs/taro";
import type { GroupRankBoardDetail } from "@mono/types";
import { boardShareWithArt, shareSelection } from "../../lib/share";
import { NotebookReader } from "../../features/notebook-reader";

export default function Board() {
  const startId = useRouter().params.id || "";
  const shared = useRef<GroupRankBoardDetail | null>(null);
  const menuScoreBoard = useRef<string>();
  useShareAppMessage((event) => boardShareWithArt(shared.current, shareSelection(event, !!shared.current && menuScoreBoard.current === shared.current.id)));
  return <NotebookReader startId={startId} onMenuScoreChange={id => { menuScoreBoard.current = id; }} onBoardChange={board => { shared.current = board; }} />;
}
