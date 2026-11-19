import { Image, View } from "@tarojs/components";
import Avatar from "./avatar";
import { crownForRank } from "../lib/theme";
import "./avatar-badge.scss";

export default function AvatarBadge({
  userId,
  version,
  name,
  rank,
  featured = false,
  championship = false,
}: {
  userId: string;
  version?: string | null;
  name: string;
  rank?: number;
  featured?: boolean;
  championship?: boolean;
}) {
  const crown =
    championship && rank && rank <= 3
      ? `/assets/championship/crown-${rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze"}.png`
      : rank
        ? crownForRank(rank)
        : undefined;
  return (
    <View
      className={`avatar-badge ${featured ? "avatar-badge-featured" : ""} ${crown ? `avatar-medal-${rank}` : ""} ${championship && crown ? "avatar-championship" : ""}`}
    >
      <Avatar userId={userId} version={version} name={name} />
      {crown && (
        <Image className="avatar-badge-crown" src={crown} mode="aspectFit" />
      )}
    </View>
  );
}
