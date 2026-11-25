import { Text, View } from "@tarojs/components";

/** Avoid the native groupName renderer's automatic privacy notice. */
export default function GroupName({ className = "" }: { className?: string }) {
  return (
    <View className={`group-name-display ${className}`}>
      <Text>本群</Text>
    </View>
  );
}
