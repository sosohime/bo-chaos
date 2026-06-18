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
    <View className="list-state">
      <Text className="state-kicker">运行配置</Text>
      <Text className="state-title">{ugc.disabledTitle}</Text>
      <Text className="state-copy">{ugc.disabledMessage}</Text>
    </View>
  );
}
