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
      <Text>{ugc.disabledTitle}</Text>
      <Text className="state-action">{ugc.disabledMessage}</Text>
    </View>
  );
}
