import { Text, View } from "@tarojs/components";
import type { BofansSystemConfigType } from "@mono/types";
import { getMiniappConfig } from "@/lib/runtime-config";

type UgcDisabledStateProps = {
  systemConfig: BofansSystemConfigType;
};

export default function UgcDisabledState({
  systemConfig,
}: UgcDisabledStateProps) {
  const { ugc } = getMiniappConfig(systemConfig);
  return (
    <View className="ugc-disabled-state">
      <Text className="ugc-disabled-kicker">内容状态</Text>
      <Text className="ugc-disabled-title">{ugc.disabledTitle}</Text>
      <Text className="ugc-disabled-copy">{ugc.disabledMessage}</Text>
    </View>
  );
}
