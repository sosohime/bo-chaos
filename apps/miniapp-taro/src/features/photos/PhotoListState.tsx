import { Text, View } from "@tarojs/components";

type PhotoListStateProps = {
  kicker: string;
  title: string;
  copy?: string;
  actionText?: string;
  tone?: "loading" | "error" | "empty";
  onClick?: () => void;
};

export default function PhotoListState({
  kicker,
  title,
  copy,
  actionText,
  tone = "empty",
  onClick,
}: PhotoListStateProps) {
  const stateLabel =
    tone === "loading" ? "加载中" : tone === "error" ? "可重试" : "待填充";
  const nextStep =
    tone === "loading"
      ? "保持当前页面"
      : tone === "error"
        ? "点击面板重试"
        : "等待内容更新";

  return (
    <View className={`list-state ${tone}`} onClick={onClick}>
      <View className="state-rail">
        <View className="state-node"></View>
        <View className="state-line"></View>
      </View>
      <View className="state-body">
        <View className="state-head">
          <Text className="state-kicker">{kicker}</Text>
          <Text className="state-badge">{stateLabel}</Text>
        </View>
        <View className="state-content">
          <View className="state-glyph">
            <View className="state-glyph-head"></View>
            <View className="state-glyph-row"></View>
            <View className="state-glyph-row short"></View>
          </View>
          <View className="state-copy-block">
            <Text className="state-title">{title}</Text>
            {copy ? <Text className="state-copy">{copy}</Text> : null}
          </View>
        </View>
        <View className="state-meta-row">
          <Text className="state-meta">下一步</Text>
          <Text className="state-meta-value">{nextStep}</Text>
        </View>
        {actionText ? <Text className="state-action">{actionText}</Text> : null}
      </View>
    </View>
  );
}
