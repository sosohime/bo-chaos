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
      <View className="bosheng-rail"></View>
      <View className="bosheng-main">
        <View>
          <Text className="bosheng-kicker">运行事件</Text>
          <Text className="bosheng-title">生日节点</Text>
        </View>
        <Text className="bosheng-status">今日</Text>
      </View>
      <View className="bosheng-meta">
        <View className="bosheng-meta-item">
          <Text className="bosheng-meta-label">类型</Text>
          <Text className="bosheng-meta-value">生日</Text>
        </View>
        <View className="bosheng-meta-item">
          <Text className="bosheng-meta-label">周期</Text>
          <Text className="bosheng-meta-value">今日</Text>
        </View>
        <View className="bosheng-meta-item">
          <Text className="bosheng-meta-label">状态</Text>
          <Text className="bosheng-meta-value">可见</Text>
        </View>
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
