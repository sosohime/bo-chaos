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
          <Text className="bosheng-kicker">事件提醒</Text>
          <Text className="bosheng-title">博生日</Text>
        </View>
        <Text className="bosheng-status">进行中</Text>
      </View>
      <View className="bosheng-meta">
        <View className="bosheng-meta-item">
          <Text className="bosheng-meta-label">事件</Text>
          <Text className="bosheng-meta-value">生日</Text>
        </View>
        <View className="bosheng-meta-item">
          <Text className="bosheng-meta-label">窗口</Text>
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
