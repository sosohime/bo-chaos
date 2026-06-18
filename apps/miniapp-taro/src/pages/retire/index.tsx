import { Button, ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useContext, useEffect, useMemo, useState } from "react";
import { tuixiu } from "@mono/const";
import { dayjs } from "@mono/utils";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";

import "./index.scss";

type CountdownParts = {
  totalMs: number;
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  percent: number;
  remainingPercent: number;
};

const BO_RETIRE_START = tuixiu.boTuiXiuStartDay;
const BO_RETIRE_TARGET = tuixiu.boTuiXiuDay;
const RETIRE_DATE_FORMAT = "YYYY-MM-DD";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCountdownParts(): CountdownParts {
  const now = dayjs();
  const totalMs = Math.max(0, BO_RETIRE_TARGET.diff(now));
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = pad(Math.floor((totalSeconds % 86400) / 3600));
  const minutes = pad(Math.floor((totalSeconds % 3600) / 60));
  const seconds = pad(totalSeconds % 60);
  const elapsed = Math.max(0, now.diff(BO_RETIRE_START));
  const total = Math.max(1, BO_RETIRE_TARGET.diff(BO_RETIRE_START));
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    percent,
    remainingPercent: 100 - percent,
  };
}

export default function Retire() {
  const { setSelectedTab } = useContext(AppContext);
  const [countdown, setCountdown] =
    useState<CountdownParts>(getCountdownParts());

  useShare({
    title: "博退休进度站",
    path: "/pages/retire/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shareCopy = useMemo(
    () =>
      `距离博退休还有 ${countdown.days} 天 ${countdown.hours}:${countdown.minutes}:${countdown.seconds}，目标日 ${BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}`,
    [countdown],
  );

  const copyCountdown = async () => {
    await Taro.setClipboardData({ data: shareCopy });
  };

  const goKowtow = () => {
    setSelectedTab("kowtow");
    Taro.switchTab({ url: "/pages/kowtow/index" });
  };

  return (
    <ScrollView scrollY className="retire-scroll" enableBackToTop>
      <View className="retire-page">
        <View className="retire-overview">
          <View className="retire-console">
            <View className="retire-console-head">
              <View>
                <Text className="retire-eyebrow">时间资源</Text>
                <Text className="retire-title">博退休倒计时</Text>
              </View>
              <Text className="retire-status">
                {countdown.totalMs === 0 ? "已抵达" : "计时中"}
              </Text>
            </View>

            <View className="retire-summary">
              <View className="retire-summary-main">
                <Text className="retire-live-label">剩余时间</Text>
                <View className="retire-days">
                  <Text className="retire-days-number">{countdown.days}</Text>
                  <Text className="retire-days-unit">天</Text>
                </View>
              </View>
              <View className="retire-summary-side">
                <Text className="retire-live-label">时分秒</Text>
                <View className="retire-clock">
                  <Text>{countdown.hours}</Text>
                  <Text>:</Text>
                  <Text>{countdown.minutes}</Text>
                  <Text>:</Text>
                  <Text>{countdown.seconds}</Text>
                </View>
              </View>
            </View>

            <View className="retire-runtime-list">
              <View className="retire-runtime-row">
                <Text className="retire-runtime-label">目标节点</Text>
                <Text className="retire-runtime-value">
                  {BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}
                </Text>
              </View>
              <View className="retire-runtime-row">
                <Text className="retire-runtime-label">已完成</Text>
                <Text className="retire-runtime-value">
                  {countdown.percent.toFixed(2)}%
                </Text>
              </View>
              <View className="retire-runtime-row">
                <Text className="retire-runtime-label">剩余</Text>
                <Text className="retire-runtime-value">
                  {countdown.remainingPercent.toFixed(2)}%
                </Text>
              </View>
            </View>

            <View className="retire-progress-block">
              <View className="retire-progress-meta">
                <Text>进度基线</Text>
                <Text>{countdown.totalMs === 0 ? "已抵达" : "按秒刷新"}</Text>
              </View>
              <View className="retire-progress">
                <View
                  className="retire-progress-fill"
                  style={{ width: `${countdown.percent}%` }}
                />
              </View>
              <View className="retire-progress-scale">
                <Text>{BO_RETIRE_START.format(RETIRE_DATE_FORMAT)}</Text>
                <Text>{BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}</Text>
              </View>
            </View>

            <View className="retire-console-actions">
              <Button className="retire-primary" onClick={copyCountdown}>
                <Text className="retire-action-title">复制状态</Text>
                <Text className="retire-action-copy">剪贴板</Text>
              </Button>
              <Button className="retire-secondary" onClick={goKowtow}>
                <Text className="retire-action-title">记录互动</Text>
                <Text className="retire-action-copy">进入互动页</Text>
              </Button>
            </View>
          </View>
        </View>

        <View className="retire-panel">
          <View className="retire-panel-head">
            <View>
              <Text className="retire-panel-kicker">节点配置</Text>
              <Text className="retire-panel-title">时间基线</Text>
            </View>
            <Text className="retire-panel-tag">UTC+8</Text>
          </View>
          <View className="retire-detail-list">
            <View className="retire-detail-row">
              <Text>起始节点</Text>
              <Text className="retire-detail-value">
                {BO_RETIRE_START.format(RETIRE_DATE_FORMAT)}
              </Text>
            </View>
            <View className="retire-detail-row">
              <Text>目标节点</Text>
              <Text className="retire-detail-value">
                {BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}
              </Text>
            </View>
            <View className="retire-detail-row">
              <Text>当前时间</Text>
              <Text className="retire-detail-value">
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
