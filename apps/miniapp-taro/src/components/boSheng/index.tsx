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
      <View>
        <Text className="bosheng-kicker">事件提醒</Text>
        <Text className="bosheng-title">博生日</Text>
      </View>
      <Text className="bosheng-status">进行中</Text>
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
