import { View, Image, Text, ITouchEvent } from "@tarojs/components";
import { useState } from "react";
import { votePhoto, cancelPhotoVote, getPhotoById } from "../../api/photo";
import Taro from "@tarojs/taro";
import "./index.scss";
import VoteImage from "../../images/vote.png";
import VoteActiveImage from "../../images/vote-active.png";
import DownloadImage from "../../images/download.png";

interface PhotoItemProps {
  photoData: {
    id: number;
    filename: string;
    hasVoted: boolean;
    votesCount: number;
  };
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

  const handleDownload = (e: ITouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    Taro.downloadFile({
      url: data.filename,
      success: (res) => {
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            Taro.showToast({ title: "保存成功", icon: "success" });
          },
          fail: () => {
            Taro.showToast({ title: "保存失败", icon: "error" });
          },
        });
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
  };

  const reloadPhotoData = async () => {
    const res = await getPhotoById(data.id);
    console.log("reload....", res);
    if (res) {
      setData(res as any);
    }
  };

  const onVote = async (e: ITouchEvent) => {
    e.stopPropagation();
    if (data.hasVoted) {
      await cancelPhotoVote(data.id);
      setData((perv) => ({
        ...perv,
        hasVoted: false,
      }));
    } else {
      await votePhoto(data.id);
      setData((perv) => ({
        ...perv,
        hasVoted: true,
      }));
    }

    await reloadPhotoData();
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
            <Text>加载中...</Text>
          </View>
        )}

        {error ? (
          <View className="error-container" onClick={handleRetry}>
            <Text>加载失败</Text>
            <Text className="retry-text">点击重试</Text>
          </View>
        ) : (
          <Image
            src={data.filename}
            className="photo"
            mode="aspectFit"
            onClick={() => onPreview(data.filename)}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </View>

      <View className="photo-actions">
        <Image
          src={DownloadImage}
          className="action-icon"
          onClick={handleDownload}
        />
        <Image
          src={data.hasVoted ? VoteActiveImage : VoteImage}
          className="action-icon"
          onClick={onVote}
        />
        <Text className="vote-count">{data.votesCount}</Text>
      </View>
    </View>
  );
};

export default PhotoItem;
