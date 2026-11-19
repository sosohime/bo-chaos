import { Text, View } from "@tarojs/components";
import "./art-lettering.scss";
/** Live glyph composition. The line box reserves the stretched ink width. */
export default function ArtLettering({ text, className = "", role = "banner", plain = false }: {
  text: string;
  className?: string;
  role?: "board" | "banner";
  plain?: boolean;
}) {
  return <View className={`art-lettering art-lettering-${role} ${plain ? "art-lettering-plain" : ""} ${className}`}>
    <Text className="art-lettering-face">{text}</Text>
  </View>;
}
