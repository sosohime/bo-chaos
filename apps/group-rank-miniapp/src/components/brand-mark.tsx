import { Image, Text, View } from "@tarojs/components";
import "./brand-mark.scss";
/** Complete byte-identical original photo; decoration belongs to its frame. */
export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return <View className={`brand-signature ${compact ? "brand-signature-compact" : ""}`}>
    <Image className="brand-mini-photo" src="/assets/brand/boge-smile.png" mode="aspectFit" />
    <View className="brand-wordmark"><Text className="brand-signature-name">博哥的小本儿</Text><View className="brand-signature-slash" aria-hidden /></View>
  </View>;
}
