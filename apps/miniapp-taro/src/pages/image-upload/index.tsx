import { View, Button, Image } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function ImageUpload() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ["album"],
      });

      if (res.tempFilePaths && res.tempFilePaths[0]) {
        await uploadImage(res.tempFilePaths[0]);
      }
    } catch (err) {
      setError("选择图片失败");
      console.error("选择图片错误:", err);
    }
  };

  const uploadImage = async (filePath: string) => {
    setLoading(true);
    setError("");
    try {
      const uploadRes = await Taro.uploadFile({
        url: "https://yuanbo.online/api/image_to_jpeg",
        filePath,
        name: "file",
      });

      if (uploadRes.statusCode === 200) {
        try {
          const data = JSON.parse(uploadRes.data);
          if (data.url) {
            setImageUrl(data.url);
          } else {
            throw new Error("返回数据格式错误");
          }
        } catch (err) {
          throw new Error("解析响应数据失败");
        }
      } else {
        throw new Error(`上传失败: ${uploadRes.statusCode}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传转换失败");
      console.error("上传错误:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="image-upload">
      {imageUrl && (
        <View className="image-preview">
          <Image src={imageUrl} mode="aspectFit" />
        </View>
      )}
      {error && <View className="error-message">{error}</View>}
      <View className="upload-button">
        <Button onClick={handleChooseImage} loading={loading}>
          选择图片
        </Button>
      </View>
    </View>
  );
}
