import { Button, Image, Text, View } from "@tarojs/components";
import type { GroupRankBoardDto } from "@mono/types";
import BookCard from "./book-card";
import { folio } from "../lib/notebook";
import "../pages/index/index.scss";

const noAction = () => {};

export function DirectoryHeading({ count, disabled = false, onCreate }: {
  count?: number;
  disabled?: boolean;
  onCreate?: () => void;
}) {
  return <View className="home-directory-heading">
    <Image className="directory-cover-art" src="/assets/arena/hero-ribbon-v3.png" mode="aspectFit" aria-hidden />
    <View className="home-directory-heading-copy">
      <Text className="home-directory-heading-title">目录</Text>
      <Text className="home-directory-heading-meta">
        {count === undefined ? "本群" : count ? `本群 · ${count} 个榜单` : "本群还没有榜单"}
      </Text>
    </View>
    {count !== undefined && <Button className="group-create" hoverClass="arena-control-pressed" hoverStartTime={0} hoverStayTime={80} disabled={disabled} onClick={onCreate}>
      <Text className="directory-create-icon" aria-hidden>＋</Text><Text>新建榜单</Text>
    </Button>}
  </View>;
}

export function DirectoryIndex({ boards, onOpen = noAction }: { boards: GroupRankBoardDto[]; onOpen?: (id: string) => void }) {
  return <View className="home-section">
    <View className="directory-index-head"><Text>页码</Text><Text>榜首成绩</Text></View>
    <View className="group-board-list">
      {boards.map((board, index) =>
        <BookCard key={board.id} board={board} pageNumber={folio(index)} onOpen={() => onOpen(board.id)} />
      )}
    </View>
  </View>;
}

export function DirectoryExamplesToggle({ expanded = false, onToggle }: { expanded?: boolean; onToggle?: () => void }) {
  return <Button className="text-action examples-toggle" hoverClass="directory-link-pressed" hoverStartTime={0} hoverStayTime={60}
    ariaLabel={expanded ? "收起官方示例" : "展开官方示例"} onClick={onToggle}>
    <Text>官方示例</Text>
    <View className={`directory-row-arrow examples-arrow${expanded ? " examples-arrow-open" : ""}`} />
  </Button>;
}

export default function DirectoryPaperPreview({ boards }: { boards: GroupRankBoardDto[] }) {
  return <View className="home-book theme--volt">
    <DirectoryHeading count={boards.length} />
    <DirectoryIndex boards={boards} />
    <DirectoryExamplesToggle />
    <View className="home-footer-actions">
      <Button className="text-action group-return-help">下次怎么打开？</Button>
    </View>
    <View className="home-corner-space" />
  </View>;
}
