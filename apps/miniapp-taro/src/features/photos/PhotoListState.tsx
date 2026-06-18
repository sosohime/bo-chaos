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
  return (
    <View className={`list-state ${tone}`} onClick={onClick}>
      <View className="state-mark">
        <View className="state-mark-line"></View>
      </View>
      <View className="state-body">
        <Text className="state-kicker">{kicker}</Text>
        <Text className="state-title">{title}</Text>
        {copy ? <Text className="state-copy">{copy}</Text> : null}
        {actionText ? <Text className="state-action">{actionText}</Text> : null}
      </View>
    </View>
  );
}
