import { Button, Image, Text, View } from "@tarojs/components";
import ArenaBackground from "./arena-background";
import { ProductIcon } from "./activity-icon";
import "./lobby-hero.scss";
export default function LobbyHero({ onCreate }: { onCreate: () => void }) {
  return <View className="lobby-stage">
    <View className="lobby-hero">
      <ArenaBackground theme="volt" presetLayout="hero" />
      <View className="lobby-hero-copy">
        <Image src="/assets/arena/brand-title.png" className="lobby-hero-title" mode="aspectFit" />
        <Text className="arena-art-alt">博哥的小本儿</Text>
        <Text className="lobby-hero-note">记成绩，看排名。</Text>
      </View>
      <Image className="lobby-hero-star" src="/assets/arena/catalog-star-v2.png" mode="aspectFit" />
    </View>
    <Button className="lobby-create" hoverClass="arena-control-pressed" hoverStartTime={0} hoverStayTime={80} onClick={onCreate}>
      <View className="lobby-create-label"><ProductIcon name="pencil" notebook /><Text>新建榜单</Text></View><View className="lobby-create-arrow" aria-hidden />
    </Button>
  </View>;
}
