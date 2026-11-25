import { Image, View } from "@tarojs/components";
import Avatar from "./avatar";
import "./notebook-portrait.scss";

/** The reference rim's measured opening owns the real avatar's crop. */
export default function NotebookPortrait({
  userId, version, name, rank = 1, alignByAvatar = false,
}: { userId: string; version?: string | null; name: string; rank?: number; alignByAvatar?: boolean }) {
  const metal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "plain";
  return <View className={`notebook-portrait notebook-portrait-${metal}${alignByAvatar ? " notebook-portrait-aligned" : ""}`}>
    <Avatar userId={userId} version={version} name={name} />
    {metal !== "plain" && <Image className="notebook-rim" src={`/assets/notebook/crown-reference-${metal}.png`} mode="scaleToFill" />}
  </View>;
}
