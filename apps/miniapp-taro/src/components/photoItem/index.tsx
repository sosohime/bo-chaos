import { View, Image, Text, ITouchEvent } from "@tarojs/components";
import { useState, useContext, useEffect } from "react";
import { votePhoto, cancelPhotoVote, getPhotoById } from "../../api/photo";
import Taro from "@tarojs/taro";
import { AppContext } from "@/lib/context";
import type { PhotoDto } from "@mono/types";
import "./index.scss";
import { normalizeMediaUrl } from "@/lib/media-url";

interface PhotoItemProps {
  photoData: PhotoDto;
  onPreview: (url: string) => void;
  size: {
    height: string;
    width: string;
  };
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  photoData,
  onPreview,
  size,
}) => {
  const [data, setData] = useState(photoData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const { systemConfig } = useContext(AppContext);
  const imageUrl = normalizeMediaUrl(data.filename);
  const title = data.name || data.category?.name || "图片";
  const categoryName = data.category?.name || "未分类";

  useEffect(() => {
    setData(photoData);
    setLoading(true);
    setError(false);
    setRetryVersion(0);
  }, [photoData.id, photoData.filename]);

  const handleDownload = (e: ITouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    Taro.downloadFile({
      url: imageUrl,
      success: (res) => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            Taro.showToast({ title: "保存成功", icon: "success" });
          },
          fail: () => {
            Taro.showModal({
              title: "保存失败",
              content: "请确认已允许保存到相册后重试。",
              showCancel: false,
            });
          },
        });
      },
      fail: () => {
        Taro.showToast({ title: "下载失败", icon: "error" });
      },
    });
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryVersion((current) => current + 1);
  };

  const reloadPhotoData = async () => {
    const res = await getPhotoById(data.id);
    if (res) {
      setData(res);
    }
  };

  const onVote = async (e: ITouchEvent) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    const previous = data;
    const nextHasVoted = !data.hasVoted;
    setData((prev) => ({
      ...prev,
      hasVoted: nextHasVoted,
      votesCount: Math.max(0, (prev.votesCount || 0) + (nextHasVoted ? 1 : -1)),
    }));
    try {
      if (previous.hasVoted) {
        await cancelPhotoVote(previous.id);
      } else {
        await votePhoto(previous.id);
      }
      await reloadPhotoData();
    } catch (error) {
      setData(previous);
      Taro.showToast({ title: "操作失败", icon: "none" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View
      className="photo-item"
      style={{
        height: size.height,
        width: size.width,
      }}
    >
      <View className="photo-box">
        {loading && (
          <View className="loading-container">
            <Text className="media-state-kicker">图片加载</Text>
            <Text className="media-state-title">加载中</Text>
          </View>
        )}

        {error ? (
          <View className="error-container" onClick={handleRetry}>
            <Text className="media-state-kicker">加载异常</Text>
            <Text className="media-state-title">加载失败</Text>
            <Text className="retry-text">点击重试</Text>
          </View>
        ) : (
          <Image
            key={`${data.id}-${retryVersion}`}
            src={imageUrl}
            className="photo"
            lazyLoad
            mode="aspectFit"
            onClick={() => onPreview(imageUrl)}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </View>

      <View className="photo-info">
        <Text className="photo-title">{title}</Text>
        <Text className="photo-subtitle">{categoryName}</Text>
      </View>

      <View className="photo-actions">
        <View className="photo-action-primary" onClick={handleDownload}>
          <Text className="photo-action-mark">↓</Text>
          <Text>保存</Text>
        </View>
        {systemConfig?.inReview && (
          <View className="photo-vote-group">
            <View
              className={`photo-action-secondary ${
                data.hasVoted ? "active" : ""
              } ${actionLoading ? "disabled" : ""}`}
              onClick={onVote}
            >
              <Text>{data.hasVoted ? "已赞" : "赞"}</Text>
            </View>
            <Text className="vote-count">{data.votesCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PhotoItem;
