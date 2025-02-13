import { View, Button, Image, Text, Input, Picker } from "@tarojs/components";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Taro from "@tarojs/taro";
import { groupBy } from "es-toolkit";
import { getCategories } from "../../api/category";
import { uploadAvatar, getUserInfo, updateNickname } from "../../api/user";
import { uploadPhoto, getMyUploadedPhotos } from "../../api/photo";
import Criminal from "../../images/criminal.png";
import Edit from "../../images/edit.png";

import "./index.scss";

interface UserInfo {
  avatarUrl: string;
  nickname: string;
  kowtowCount: number;
  lastKowtowTime: string;
  joinTime: string;
}

export interface CategoryType {
  id: number;
  system: string;
  name: string;
  secondCategory: string;
  updatedAt: Date;
}

export default function My() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatarUrl: "",
    nickname: "",
    kowtowCount: 0,
    lastKowtowTime: "",
    joinTime: "",
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<any>([]);
  const [approvedPhotos, setApprovedPhotos] = useState<any>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  // 删除静态的 systems 和 categoryMap
  const systems = Object.values(
    categories.reduce((p, c) => {
      if (!p[c.system]) {
        p[c.system] = {
          label: c.name,
          value: c.system,
        };
      }
      return p;
    }, {}),
  ) as { label: string; value: string }[];

  const categoryMap = groupBy(
    categories.filter((item) => item.system === selectedSystem?.value),
    (item) => item.secondCategory,
  );

  useEffect(() => {
    fetchUserInfo();
    fetchCategories();
    fetchPhotos();
  }, []);

  const fetchCategories = async () => {
    try {
      const categories = (await getCategories()) as unknown as CategoryType[];
      setCategories(categories);
    } catch (error) {
      console.error("获取分类失败", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const info = await getUserInfo();
      setUserInfo(info as any);
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await getMyUploadedPhotos();
      const { pending, approved } = (res as any).reduce(
        (p, c) => {
          if (c.published) {
            p.approved.push(c);
          } else {
            p.pending.push(c);
          }
          return p;
        },
        {
          pending: [],
          approved: [],
        },
      );
      setPendingPhotos(pending);
      setApprovedPhotos(approved);
    } catch (error) {
      console.error("获取照片列表失败:", error);
    }
  };

  const handleCategorySelect = (secondCategory: string) => {
    const category = categories.find(
      (item) =>
        item.system === selectedSystem?.value &&
        item.secondCategory === secondCategory,
    );
    if (category) {
      setSelectedCategory(category.secondCategory);
      setSelectedCategoryId(+category.id);
    }
  };

  const handleAvatarClick = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });
      const uploadRes = (await uploadAvatar({
        filePath: res.tempFilePaths[0],
      })) as any;
      setUserInfo(uploadRes);
    } catch (error) {
      console.error("选择头像失败:", error);
    }
  };

  const handleNameChange = async () => {
    try {
      await updateNickname(editingName);
      setUserInfo((prev) => ({ ...prev, nickname: editingName }));
      setIsEditingName(false);
      Taro.showToast({
        title: "修改成功",
        icon: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("修改用户名失败:", error);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditingName(""); // 清空临时存储的名字
  };

  const handleAddImages = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });
      setSelectedImages((prev) => [...prev, ...res.tempFilePaths]);
    } catch (error) {
      console.error("选择图片失败:", error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 添加新的状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<Record<number, boolean>>({});

  const handleSubmit = async () => {
    if (
      !selectedSystem ||
      (!selectedCategoryId && !newCategoryName) ||
      !selectedImages.length
    ) {
      Taro.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }

    setIsSubmitting(true);
    try {
      const tasks = selectedImages.map((img) => ({
        name: selectedSystem.label,
        system: selectedSystem.value,
        categoryId: +selectedCategoryId,
        newCategory: newCategoryName,
        filePath: img,
      }));

      const results = await Promise.allSettled(
        tasks.map((data, index) =>
          uploadPhoto(data).then(() => {
            setUploadStatus((prev) => ({ ...prev, [index]: true }));
            return index;
          }),
        ),
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failedCount = results.filter((r) => r.status === "rejected").length;

      if (failedCount === 0) {
        // 全部成功
        Taro.showToast({
          title: "上传成功",
          icon: "success",
          duration: 2000,
        });
        // 清空表单
        setSelectedImages([]);
        setSelectedSystem(null);
        setSelectedCategory("");
        setSelectedCategoryId(0);
        setNewCategoryName("");
        setIsNewCategory(false);
        setUploadStatus({});
      } else if (successCount > 0) {
        // 部分成功
        Taro.showModal({
          title: "提示",
          content: `${successCount}张图片上传成功，${failedCount}张上传失败，您可以重新上传失败的图片`,
          showCancel: false,
        });
        // 移除成功的图片
        const successIndexes = results
          .map((r, i) => (r.status === "fulfilled" ? i : -1))
          .filter((i) => i !== -1);
        setSelectedImages((prev) =>
          prev.filter((_, index) => !successIndexes.includes(index)),
        );
        setUploadStatus({});
      } else {
        // 全部失败
        Taro.showToast({
          title: "上传失败，请重试",
          icon: "error",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("提交失败:", error);
      Taro.showToast({
        title: "上传失败，请重试",
        icon: "error",
        duration: 2000,
      });
    } finally {
      fetchPhotos();
      setIsSubmitting(false);
    }
  };

  return (
    <View className="my-container">
      <View className="user-info">
        <Image
          className="avatar"
          mode="aspectFit"
          src={userInfo.avatarUrl || Criminal}
          onClick={handleAvatarClick}
        />
        <View className="user-name">
          <Text className="hello">你好，</Text>
          {isEditingName ? (
            <View className="nickname-edit">
              <Input
                className="nickname-input"
                value={editingName}
                onInput={(e) => setEditingName(e.detail.value)}
                placeholder={userInfo.nickname}
              />
              <View className="nickname-buttons">
                <Text className="confirm" onClick={handleNameChange}>
                  确定
                </Text>
                <Text className="cancel" onClick={handleNameCancel}>
                  取消
                </Text>
              </View>
            </View>
          ) : (
            <View
              onClick={() => {
                setIsEditingName(true);
                setEditingName(userInfo.nickname);
              }}
            >
              <Text className="nickname">
                {userInfo.nickname || "点击设置昵称"}
              </Text>
              <Image
                className="nickname-edit-icon"
                mode="aspectFit"
                src={Edit}
              />
            </View>
          )}
        </View>
      </View>

      <View className="record-section">
        <View className="section-title">磕头记录</View>
        <Text>
          加入BoFans的{" "}
          {userInfo.joinTime
            ? Math.max(
                1,
                Math.ceil(dayjs().diff(dayjs(userInfo.joinTime), "day", true)),
              )
            : 0}{" "}
          天中， 累计磕头 {userInfo.kowtowCount} 次
        </Text>
      </View>

      <View className="upload-section">
        <View className="section-title">珍贵资料上传</View>
        <Picker
          mode="selector"
          range={systems}
          rangeKey="label"
          onChange={(e) => {
            setSelectedSystem(systems[e.detail.value]);
          }}
        >
          <View className="picker">{selectedSystem?.label || "选择板块"}</View>
        </Picker>

        {selectedSystem && (
          <>
            <View className="category-section">
              {!isNewCategory ? (
                <Picker
                  mode="selector"
                  range={Object.keys(categoryMap)}
                  onChange={(e) =>
                    handleCategorySelect(
                      Object.keys(categoryMap)[e.detail.value],
                    )
                  }
                >
                  <View className="picker">
                    {selectedCategory || "选择分类"}
                  </View>
                </Picker>
              ) : (
                <Input
                  className="category-input"
                  value={newCategoryName}
                  onInput={(e) => setNewCategoryName(e.detail.value)}
                  placeholder="输入新分类名称"
                />
              )}
              <View
                className={`checkbox ${isSubmitting ? "disabled" : ""}`}
                onClick={() =>
                  !isSubmitting && setIsNewCategory(!isNewCategory)
                }
              >
                <Text>{isNewCategory ? "✓" : ""}</Text>
                <Text>创建新分类</Text>
              </View>

              <Button
                className="add-image"
                disabled={isSubmitting}
                onClick={handleAddImages}
              >
                添加图片
              </Button>

              <Button
                className={`submit-btn ${isSubmitting ? "loading" : ""}`}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "上传中..." : "提交"}
              </Button>
            </View>

            {selectedImages.length > 0 && (
              <View className="image-list">
                {selectedImages.map((img, index) => (
                  <View key={index} className="image-item">
                    <Image
                      src={img}
                      mode="aspectFit"
                      className="preview-image"
                    />
                    <View
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      ✕
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <View className="history-section">
        <View className="section-title">审核中</View>
        <View className="photo-grid">
          {pendingPhotos.length > 0 ? (
            pendingPhotos.map((photo, index) => (
              <Image
                key={index}
                src={photo.filename}
                mode="aspectFit"
                className="history-image"
              />
            ))
          ) : (
            <Text>妹有</Text>
          )}
        </View>

        <View className="section-title">已通过</View>
        <View className="photo-grid">
          {approvedPhotos.length ? (
            approvedPhotos.map((photo, index) => (
              <Image
                key={index}
                src={photo.filename}
                mode="aspectFit"
                className="history-image"
              />
            ))
          ) : (
            <Text>{pendingPhotos.length > 0 ? "妹有" : "也妹有"}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
