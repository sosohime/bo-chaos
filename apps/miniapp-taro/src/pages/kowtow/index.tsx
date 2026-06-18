import { View, Button, Text, Canvas } from "@tarojs/components";
import { useState, useEffect, useRef, useContext } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { AppContext } from "@/lib/context";
import { getMiniappConfig } from "@/lib/runtime-config";
import { useShare } from "@/lib/share";
import useLocalStorage from "@/hooks/use-local-storage";
import God from "@/images/kowtow/god.png";
import God2 from "@/images/kowtow/god2.jpg";
import God3 from "@/images/kowtow/god3.png";
import { getKowtowStats, batchKowtow } from "../../api/kowtow";
import type { KowtowStatsDto } from "@mono/types";
import SwiperImg from "@/components/swiperImg";
import "./index.scss";
type KowtowStats = Omit<KowtowStatsDto, "todayKowtowedUser" | "totalCount"> & {
  todayKowtowedUser: number | "-";
  totalCount: number | "-";
};
interface Animation {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
}

const KOWTOW_SYNC_INTERVAL_MS = 2000;

export default function Kowtow() {
  const [kowtowCount, setKowtowCount] = useLocalStorage<number>(
    "nowKowtowCount",
    0,
  );
  const swiperImages = [
    {
      img: God,
      ratio: (351 / 476).toFixed(2),
      canvas: {
        top: "15%",
        left: "68%",
        width: 90,
        height: 120,
      },
    },
    {
      img: God2,
      ratio: (256 / 388).toFixed(2),
      canvas: {
        top: "20%",
        left: "18%",
        width: 90,
        height: 120,
      },
    },
    {
      img: God3,
      ratio: (184 / 210).toFixed(2),
      canvas: {
        top: "20%",
        left: "10%",
        width: 90,
        height: 120,
      },
    },
  ];
  const [canvasInfo, setCanvasInfo] = useState({
    swiperIndex: 0,
    canvas: {
      top: "15%",
      left: "68%",
      width: 90,
      height: 120,
    },
  });
  const kowtowCountRef = useRef(kowtowCount);
  useEffect(() => {
    kowtowCountRef.current = kowtowCount;
  }, [kowtowCount]);

  const operationPulseLabel = "+1";
  const animationQueue = useRef<Animation[]>([]);
  const animationState = useRef(false);

  const { systemConfig } = useContext(AppContext);
  const miniapp = getMiniappConfig(systemConfig);
  const [kowtowStats, setKowtowStats] = useState<KowtowStats>({
    todayKowtowedUser: "-",
    totalCount: "-",
    iKowtowedToday: false,
  });
  const [syncFailed, setSyncFailed] = useState(false);
  const [isKowtowing, setIsKowtowing] = useState(false);

  useEffect(() => {
    if (systemConfig) {
      Taro.setNavigationBarTitle({
        title: systemConfig.inReview
          ? miniapp.pages.reviewKowtowTitle
          : miniapp.pages.kowtowTitle,
      });
    }
  }, [systemConfig]);

  useShare({
    title: "BoFans 今日互动状态",
    path: "/pages/kowtow/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });
  const handleKowtow = async () => {
    if (isKowtowing) return;
    setIsKowtowing(true);
    try {
      await createLikeAnimation();
      await setKowtowCount(kowtowCount + 1);
    } catch (error) {
      console.error("磕头动画失败:", error);
    } finally {
      setIsKowtowing(false);
    }
  };

  const syncKowtowStats = async () => {
    try {
      let batchBlockData;
      const paramsKowtow = kowtowCountRef.current;
      if (paramsKowtow > 0) {
        batchBlockData = await batchKowtow({ count: paramsKowtow });
      }
      const kowtowStatsData = await getKowtowStats();
      if (kowtowStatsData) {
        setKowtowStats(kowtowStatsData);
        batchBlockData && setKowtowCount(0);
      }
      setSyncFailed(false);
    } catch (error) {
      console.error("同步互动状态失败:", error);
      setSyncFailed(true);
    }
  };

  // 每隔两秒查询一次最新互动状态。
  useEffect(() => {
    syncKowtowStats();
    const timer = setInterval(syncKowtowStats, KOWTOW_SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // 轮播图变化时同步 Canvas 反馈位置。
  const changeSwiper = (e: number) => {
    const info = swiperImages[e];
    const { canvas } = info;
    setCanvasInfo({
      swiperIndex: e,
      canvas,
    });
  };

  // useEffect(() => {
  //   // 初始化 canvas context
  //   const query = Taro.createSelectorQuery();
  //   query
  //     .select("#god-bo-canvas")
  //     .fields({ node: true, size: true })
  //     .exec((res) => {
  //     });
  // }, []);
  const createLikeAnimation = () => {
    const query = Taro.createSelectorQuery();
    const fontSize = 20;
    query
      .select("#god-bo-canvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        if (!canvas) {
          return;
        }
        const ctx = canvas.getContext("2d");
        const xSkew = Math.ceil((Math.random() * canvas.width) / 6);
        const startX = fontSize / 2 + xSkew;
        const startY = canvas.height - 20;
        const animationId = Date.now();
        animationQueue.current.push({
          id: animationId,
          x: startX,
          y: startY,
          text: operationPulseLabel,
          opacity: 1,
        });
        // image = null;
        if (animationState.current) return;
        animationState.current = true;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
          // 更新文字阶段
          animationQueue.current = animationQueue.current.filter(
            (animation: Animation) => animation.opacity > 0,
          );
          animationQueue.current = animationQueue.current.map(
            (animation: Animation) => {
              let { id, x, y, opacity, text } = animation;
              return {
                id,
                x,
                y: (y -= 2),
                text,
                opacity: parseFloat((opacity - 0.02).toFixed(2)),
              };
            },
          );

          // 渲染文字阶段
          animationQueue.current.map((animation: Animation) => {
            // 绘制阶段
            ctx.save();
            ctx.font = `700 ${fontSize}px sans-serif`;
            ctx.strokeStyle = `rgba(255, 255, 255, ${animation.opacity})`;
            ctx.lineWidth = 3;
            ctx.fillStyle = `rgba(0, 82, 217, ${animation.opacity})`;
            ctx.textAlign = "center";
            ctx.strokeText(animation.text, animation.x, animation.y);
            ctx.fillText(animation.text, animation.x, animation.y);
            ctx.restore();
          });
          if (animationQueue.current.length > 0) {
            requestAnimationFrame(animate);
          } else {
            animationState.current = false;
          }
        };
        animate();
      });
  };
  return (
    <View className="kowtow-container">
      {systemConfig?.inReview ? (
        <View className="kowtow-review-panel">
          <View className="kowtow-review-head">
            <View>
              <Text className="kowtow-eyebrow">图片处理服务</Text>
              <Text className="kowtow-title">BoFans 图片压缩工具</Text>
            </View>
            <Text className="kowtow-review-status">可用</Text>
          </View>
          <View className="kowtow-review-summary">
            <View className="kowtow-review-primary">
              <Text className="kowtow-review-label">当前流程</Text>
              <Text className="kowtow-review-value">上传审核</Text>
            </View>
            <View className="kowtow-review-row">
              <Text className="kowtow-review-label">分类</Text>
              <Text className="kowtow-review-meta">个人中心选择</Text>
            </View>
            <View className="kowtow-review-row">
              <Text className="kowtow-review-label">处理</Text>
              <Text className="kowtow-review-meta">审核后压缩</Text>
            </View>
            <View className="kowtow-review-row">
              <Text className="kowtow-review-label">查看</Text>
              <Text className="kowtow-review-meta">对应分类页</Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View className="kowtow-console-head">
            <View>
              <Text className="kowtow-eyebrow">互动状态</Text>
              <Text className="kowtow-title">今日状态</Text>
            </View>
            <Text className="kowtow-status">
              {syncFailed ? "待重试" : "正常"}
            </Text>
          </View>
          <View className="kowtow-console-body">
            <View className="kowtow-stats">
              <View className="kowtow-stat-primary">
                <Text className="kowtow-stat-label">累计记录</Text>
                <Text className="kowtow-stat-value">
                  {kowtowCount && kowtowStats.totalCount !== "-"
                    ? (kowtowStats.totalCount as number) + kowtowCount
                    : kowtowStats.totalCount}
                </Text>
              </View>
              <View className="kowtow-stat-row">
                <Text className="kowtow-stat-label">
                  今日参与 <Text className="utc">UTC+8</Text>
                </Text>
                <Text className="kowtow-stat-meta">
                  {kowtowStats.todayKowtowedUser}
                </Text>
              </View>
              <View className="kowtow-stat-row">
                <Text className="kowtow-stat-label">本地队列</Text>
                <Text className="kowtow-stat-meta">
                  {kowtowCount ? `待同步 ${kowtowCount}` : "已同步"}
                </Text>
              </View>
              <View className="kowtow-stat-row">
                <Text className="kowtow-stat-label">同步周期</Text>
                <Text className="kowtow-stat-meta">
                  {KOWTOW_SYNC_INTERVAL_MS / 1000}s
                </Text>
              </View>
            </View>
            <View className="kowtow-action-footer">
              <View className="kowtow-action-head">
                <View>
                  <Text className="kowtow-action-kicker">写入队列</Text>
                  <Text className="love">写入互动记录</Text>
                </View>
                <Text className="kowtow-action-state">
                  {kowtowCount ? "待同步" : "可写入"}
                </Text>
              </View>
              {kowtowStats.totalCount !== "-" && (
                <Text className="kowtow-copy">
                  {kowtowStats.iKowtowedToday
                    ? "今日状态已记录，本地队列会自动同步"
                    : "今日状态未记录，可写入一次本地队列"}
                </Text>
              )}
              {syncFailed && (
                <Text className="sync-warning" onClick={syncKowtowStats}>
                  加载异常，点击重试
                </Text>
              )}
              <Button
                className={`submit-kowtow ${isKowtowing ? "loading" : ""}`}
                type="primary"
                onClick={handleKowtow}
              >
                {isKowtowing ? "写入中" : "写入本地队列"}
              </Button>
            </View>
          </View>
          <BoSheng boxStyle={{ marginTop: "12px" }} />
          <View className="god-bo">
            <View className="god-bo-head">
              <View>
                <Text className="god-bo-kicker">资源对象</Text>
                <Text className="god-bo-title">当前图片</Text>
              </View>
              <Text className="god-bo-index">
                资源 {canvasInfo.swiperIndex + 1}/{swiperImages.length}
              </Text>
            </View>
            <View className="god-bo-resource-list">
              <View className="god-bo-resource-row">
                <Text className="god-bo-resource-label">当前</Text>
                <Text className="god-bo-resource-value">
                  #{canvasInfo.swiperIndex + 1}
                </Text>
              </View>
              <View className="god-bo-resource-row">
                <Text className="god-bo-resource-label">总量</Text>
                <Text className="god-bo-resource-value">
                  {swiperImages.length}
                </Text>
              </View>
              <View className="god-bo-resource-row">
                <Text className="god-bo-resource-label">队列</Text>
                <Text className="god-bo-resource-value">
                  {kowtowCount ? `待同步 ${kowtowCount}` : "已同步"}
                </Text>
              </View>
            </View>
            <Canvas
              type="2d"
              id="god-bo-canvas"
              style={`top: ${canvasInfo.canvas.top};
                left: ${canvasInfo.canvas.left};
                height: ${canvasInfo.canvas.height}px;
                width: ${canvasInfo.canvas.width}px;`}
              className="canvas"
            />
            <View className="god-bo-stage">
              <SwiperImg
                changeSwiper={changeSwiper}
                images={swiperImages}
                accountIndex={canvasInfo.swiperIndex}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
