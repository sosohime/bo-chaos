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
      <View className="ugc-disabled-head">
        <View>
          <Text className="ugc-disabled-kicker">运行配置</Text>
          <Text className="ugc-disabled-title">{ugc.disabledTitle}</Text>
        </View>
        <Text className="ugc-disabled-status">已关闭</Text>
      </View>
      <Text className="ugc-disabled-copy">{ugc.disabledMessage}</Text>
      <View className="ugc-disabled-summary">
        <View className="ugc-disabled-primary">
          <Text className="ugc-disabled-label">入口状态</Text>
          <Text className="ugc-disabled-value">已隐藏</Text>
        </View>
        <View className="ugc-disabled-row">
          <Text className="ugc-disabled-label">请求状态</Text>
          <Text className="ugc-disabled-meta">已暂停</Text>
        </View>
        <View className="ugc-disabled-row">
          <Text className="ugc-disabled-label">恢复来源</Text>
          <Text className="ugc-disabled-meta">运行配置</Text>
        </View>
      </View>
    </View>
  );
}
