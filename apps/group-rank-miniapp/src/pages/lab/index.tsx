import { useRef, useState } from "react";
import { Button, Text, View } from "@tarojs/components";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import "./index.scss";

type Probe = "login" | "group" | "privacy";

export default function Lab() {
  const [results, setResults] = useState<Partial<Record<Probe, string>>>({});
  const [pending, setPending] = useState<Probe | null>(null);
  const busy = useRef(false);
  const account = Taro.getAccountInfoSync().miniProgram;
  const launch = Taro.getLaunchOptionsSync();

  useShareAppMessage(() => ({
    title: "群排行 · 群入口验证",
    path: "/pages/lab/index?source=group-share",
  }));

  async function run(probe: Probe) {
    if (busy.current) return;
    busy.current = true;
    setPending(probe);
    try {
      let message: string;
      if (probe === "login") {
        const result = await Taro.login();
        message = result.code
          ? "客户端获取登录凭证成功。尚未接入服务端换取身份，不能据此认定已登录；凭证不展示、不保存。"
          : "接口未返回登录凭证，登录能力未验证。";
      } else if (probe === "group") {
        const result = await Taro.getGroupEnterInfo();
        const hasPayload =
          "encryptedData" in result &&
          typeof result.encryptedData === "string" &&
          result.encryptedData.length > 0 &&
          "iv" in result &&
          typeof result.iv === "string" &&
          result.iv.length > 0;
        message = hasPayload
          ? "已返回群入口加密数据。尚未完成服务端验证与群映射，不能据此授予成员权限；原始数据不展示、不保存。"
          : "调用完成，但没有获得可用于后续验证的完整加密数据。";
      } else {
        const result =
          await new Promise<Taro.getPrivacySetting.SuccessCallbackResult>(
            (resolve, reject) => {
              Taro.getPrivacySetting({ success: resolve, fail: reject });
            },
          );
        message = result.needAuthorization
          ? "当前需要隐私授权。此处仅查询状态，不请求同意；先在后台核对真实信息处理范围。"
          : "当前接口未要求额外隐私授权，不代表全部业务已满足隐私要求。";
      }
      setResults((previous) => ({ ...previous, [probe]: message }));
    } catch {
      const message =
        probe === "group"
          ? "群入口调用失败。请从真实微信群内的分享卡片重新进入，并核对当前账号权限、基础库和入口场景。"
          : "调用失败。请核对目标 AppID、账号权限、微信版本和基础库后重试。";
      setResults((previous) => ({ ...previous, [probe]: message }));
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  const probes: { id: Probe; title: string; description: string }[] = [
    {
      id: "login",
      title: "微信登录",
      description: "仅验证客户端接口，不发送凭证或创建业务账号。",
    },
    {
      id: "group",
      title: "群入口",
      description:
        "分别在 A 群、B 群与跨群转发场景验证，获取群信息不等于验证群成员。",
    },
    {
      id: "privacy",
      title: "隐私状态",
      description: "检查当前账号的隐私授权状态，不触发同意或修改后台配置。",
    },
  ];

  return (
    <View className="page">
      <Text className="eyebrow">P0 · 开发验证</Text>
      <Text className="title">微信能力验证</Text>
      <Text className="description">
        结果仅用于当前设备和入口的技术验证。群空间、服务端登录及内容审核尚未接通。
      </Text>
      <View className="panel">
        <Text className="label">当前运行环境</Text>
        <Text className="note">AppID：{account.appId || "未配置"}</Text>
        <Text className="note">版本环境：{account.envVersion || "未知"}</Text>
        <Text className="note">启动场景：{launch.scene}</Text>
      </View>
      {probes.map((probe) => (
        <View className="panel" key={probe.id}>
          <Text className="label">{probe.title}</Text>
          <Text className="description">{probe.description}</Text>
          <Button
            className="action"
            loading={pending === probe.id}
            disabled={pending !== null}
            onClick={() => run(probe.id)}
          >
            {pending === probe.id ? "验证中" : "开始验证"}
          </Button>
          <Text className="probe-result">
            {results[probe.id] || "尚未验证"}
          </Text>
        </View>
      ))}
      <Button className="action secondary" openType="share">
        分享到测试群
      </Button>
      <Text className="note">
        仅分享此验证页的入口，不携带用户信息、群标识或成绩。技术验证页在正式发布前需移除。
      </Text>
    </View>
  );
}
