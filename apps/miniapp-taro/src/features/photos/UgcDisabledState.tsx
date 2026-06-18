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
          <Text className="ugc-disabled-label">内容入口</Text>
          <Text className="ugc-disabled-value">隐藏</Text>
        </View>
        <View className="ugc-disabled-row">
          <Text className="ugc-disabled-label">数据请求</Text>
          <Text className="ugc-disabled-meta">暂停</Text>
        </View>
        <View className="ugc-disabled-row">
          <Text className="ugc-disabled-label">恢复方式</Text>
          <Text className="ugc-disabled-meta">配置</Text>
        </View>
      </View>
    </View>
  );
}
