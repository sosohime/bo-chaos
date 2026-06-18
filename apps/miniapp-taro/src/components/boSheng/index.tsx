import { Text, View } from "@tarojs/components";
import { isBoSheng } from "@/lib/bosheng";
import "./index.scss";

export default function BoSheng({
  boxStyle,
}: {
  boxStyle?: React.CSSProperties;
}) {
  const isBirthday = isBoSheng();

  const content = (
    <View className="birthday-container">
      <View className="bosheng-marker">
        <View className="bosheng-marker-dot"></View>
      </View>
      <View className="bosheng-copy">
        <Text className="bosheng-kicker">运行事件</Text>
        <Text className="bosheng-title">生日节点</Text>
      </View>
      <View className="bosheng-state">
        <Text className="bosheng-state-label">状态</Text>
        <Text className="bosheng-status">今日可见</Text>
      </View>
    </View>
  );

  return isBirthday ? (
    boxStyle ? (
      <View style={boxStyle}>{content}</View>
    ) : (
      content
    )
  ) : (
    <></>
  );
}
