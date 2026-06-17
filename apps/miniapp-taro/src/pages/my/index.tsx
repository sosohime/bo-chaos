import {
  View,
  Button,
  Image,
  Text,
  Input,
  Picker,
  ScrollView,
} from "@tarojs/components";
import { useState, useEffect, useContext } from "react";
import { dayjs } from "@mono/utils";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";
import { groupBy } from "es-toolkit";
import { getCategories } from "../../api/category";
import { uploadAvatar, getUserInfo, updateNickname } from "../../api/user";
import { uploadPhoto, getMyUploadedPhotos } from "../../api/photo";
import { getBoDailyCard, type BoDailyCard } from "../../api/bo";
import type { CategorySystem, PhotoCategoryDto } from "@mono/types";
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

interface UploadedPhoto {
  id: number;
  filename: string;
  status: string;
  published?: boolean;
}

interface UploadHistoryState {
  items: UploadedPhoto[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

const HISTORY_PAGE_SIZE = 18;

const emptyHistoryState: UploadHistoryState = {
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  total: 0,
};

type CategoryType = PhotoCategoryDto;

export default function My() {
  const { systemConfig } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);
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
  const [pendingPhotos, setPendingPhotos] =
    useState<UploadHistoryState>(emptyHistoryState);
  const [approvedPhotos, setApprovedPhotos] =
    useState<UploadHistoryState>(emptyHistoryState);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [boDailyCard, setBoDailyCard] = useState<BoDailyCard | null>(null);

  useShare({
    title: "快来博Fans，今天你磕了没？",
    path: "/pages/kowtow/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  // 删除静态的 systems 和 categoryMap
  const systems = Object.values(
    categories.reduce((p, c) => {
      if (!p[c.system]) {
        p[c.system] = {
          label: c.systemName,
          value: c.system,
        };
      }
      return p;
    }, {}),
  ) as { label: string; value: string }[];

  const categoryMap = groupBy(
    categories.filter((item) => item.system === selectedSystem?.value),
    (item) => item.name,
  );

  useEffect(() => {
    fetchUserInfo();
    fetchCategories();
    fetchPhotos(true);
    fetchBoDailyCard();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      Taro.showNavigationBarLoading();
      await Promise.all([
        fetchUserInfo(),
        fetchCategories(),
        fetchPhotos(true),
        fetchBoDailyCard(),
      ]);
      Taro.hideNavigationBarLoading();
      Taro.showToast({
        title: "刷新成功",
        icon: "success",
      });
    } catch (error) {
      console.error("刷新失败:", error);
      Taro.hideNavigationBarLoading();
      Taro.showToast({
        title: "刷新失败",
        icon: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await getCategories();
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

  const fetchBoDailyCard = async () => {
    try {
      const card = await getBoDailyCard();
      setBoDailyCard(card as BoDailyCard);
    } catch (error) {
      console.error("获取Bo灵感失败:", error);
    }
  };

  const fetchPhotoPage = async (
    status: "pending" | "approved",
    reset = false,
  ) => {
    const state = status === "pending" ? pendingPhotos : approvedPhotos;
    if ((!reset && state.loading) || (!reset && !state.hasMore)) return;

    const setState =
      status === "pending" ? setPendingPhotos : setApprovedPhotos;
    const nextPage = reset ? 1 : state.page + 1;

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getMyUploadedPhotos({
        status,
        page: nextPage,
        pageSize: HISTORY_PAGE_SIZE,
      });
      setState((prev) => ({
        items: reset ? res.data : [...prev.items, ...res.data],
        page: res.meta.page,
        total: res.meta.total,
        hasMore: res.meta.hasMore,
        loading: false,
      }));
    } catch (error) {
      console.error("获取照片列表失败:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchPhotos = async (reset = false) => {
    if (reset) {
      setPendingPhotos(emptyHistoryState);
      setApprovedPhotos(emptyHistoryState);
    }
    await Promise.all([
      fetchPhotoPage("pending", reset),
      fetchPhotoPage("approved", reset),
    ]);
  };

  const handleHistoryReachBottom = () => {
    fetchPhotoPage("pending");
    fetchPhotoPage("approved");
  };

  const handleCategorySelect = (secondCategory: string) => {
    const category = categories.find(
      (item) =>
        item.system === selectedSystem?.value && item.name === secondCategory,
    );
    if (category) {
      setSelectedCategory(category.name);
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

  const navToApprove = (approval: any): void => {
    console.log("1323");
    Taro.navigateTo({
      url: `/pages/approve/index?approval=${approval}`, // 携带参数
    });
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

  const handleSystemChange = (e) => {
    setSelectedSystem(systems[e.detail.value]);
    // 清空分类相关的状态
    setSelectedCategory("");
    setSelectedCategoryId(0);
    setNewCategoryName("");
    setIsNewCategory(false);
  };

  const handleAddImages = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 20,
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        sizeType: ["compressed"],
      });
      setSelectedImages((prev) => [
        ...prev,
        ...res.tempFiles.map((f) => f.tempFilePath),
      ]);
    } catch (error) {
      console.error("选择图片失败:", error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 添加新的状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    Record<
      number,
      {
        process: number;
        status: "waiting" | "uploading" | "finish" | "error";
      }
    >
  >({});

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
        system: selectedSystem.value as CategorySystem,
        categoryId: +selectedCategoryId,
        newCategory: newCategoryName,
        filePath: img,
      }));

      const results = await Promise.allSettled(
        tasks.map((data, index) => {
          setUploadStatus((prev) => ({
            ...prev,
            [index]: {
              process: 0,
              status: "uploading",
            },
          }));

          return uploadPhoto(data, (process) => {
            setUploadStatus((prev) => ({
              ...prev,
              [index]: { ...prev[index], process },
            }));
          }).then(() => {
            setUploadStatus((prev) => ({
              ...prev,
              [index]: { ...prev[index], status: "finish" },
            }));
            return index;
          });
        }),
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
      fetchPhotos(true);
      fetchBoDailyCard();
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      scrollY
      className="my-container"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={onRefresh}
      onScrollToLower={handleHistoryReachBottom}
    >
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

      <BoSheng boxStyle={{ padding: "14px 20px 0 20px" }} />

      {boDailyCard && (
        <View className="bo-daily-card">
          <View className="bo-daily-topline">
            <Text>{boDailyCard.date}</Text>
            <Text>{boDailyCard.mood}</Text>
          </View>
          <View className="bo-daily-title">{boDailyCard.greeting}</View>
          <View className="bo-daily-skill">{boDailyCard.title}</View>
          <Text className="bo-daily-copy">{boDailyCard.insight}</Text>
          <Text className="bo-daily-action">{boDailyCard.action}</Text>
          <View className="bo-daily-stats">
            <Text>香火 {boDailyCard.stats.kowtowCount}</Text>
            <Text>资料 {boDailyCard.stats.uploadCount}</Text>
            <Text>通过 {boDailyCard.stats.approvedCount}</Text>
          </View>
        </View>
      )}

      {!systemConfig?.inReview && (
        <View className="record-section">
          <View className="section-title">磕头记录</View>
          <Text>
            加入BoFans的{" "}
            {userInfo.joinTime
              ? Math.max(
                  1,
                  Math.ceil(
                    dayjs().diff(dayjs(userInfo.joinTime), "day", true),
                  ),
                )
              : 0}{" "}
            天中， 累计磕头 {userInfo.kowtowCount} 次
          </Text>
        </View>
      )}

      <View className="upload-section">
        <View className="section-title">
          {systemConfig?.inReview ? "图片上传" : "珍贵资料上传"}
        </View>
        <Picker
          mode="selector"
          range={systems}
          rangeKey="label"
          onChange={handleSystemChange}
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
                    {uploadStatus[index]?.status === "uploading" && (
                      <View className="upload-process">
                        <View className="circle-progress">
                          <View
                            className="progress-value"
                            style={{
                              background: `conic-gradient(#4CAF50 ${uploadStatus[index].process * 3.6}deg, rgba(255, 255, 255, 0.3) 0deg)`,
                            }}
                          />
                          <View className="progress-text">
                            {Math.round(uploadStatus[index].process)}%
                          </View>
                        </View>
                      </View>
                    )}
                    {uploadStatus[index]?.status === "finish" && (
                      <View className="upload-success">✓</View>
                    )}
                    {!isSubmitting && (
                      <View
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        ✕
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <View className="history-section">
        <View className="section-title" onClick={() => navToApprove("peding")}>
          审核中 {pendingPhotos.total ? `(${pendingPhotos.total})` : ""}
        </View>
        <View className="photo-grid">
          {pendingPhotos.items.length > 0
            ? pendingPhotos.items.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.filename}
                  mode="aspectFill"
                  lazyLoad
                  className="history-image"
                />
              ))
            : !pendingPhotos.loading && <Text>妹有</Text>}
          {pendingPhotos.loading && (
            <Text className="history-loading">加载中...</Text>
          )}
        </View>

        <View className="section-title">
          已通过 {approvedPhotos.total ? `(${approvedPhotos.total})` : ""}
        </View>
        <View className="photo-grid">
          {approvedPhotos.items.length
            ? approvedPhotos.items.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.filename}
                  mode="aspectFill"
                  lazyLoad
                  className="history-image"
                />
              ))
            : !approvedPhotos.loading && (
                <Text>
                  {pendingPhotos.items.length > 0 ? "妹有" : "也妹有，应该有"}
                </Text>
              )}
          {approvedPhotos.loading && (
            <Text className="history-loading">加载中...</Text>
          )}
        </View>
        {(pendingPhotos.hasMore || approvedPhotos.hasMore) && (
          <Button className="load-more" onClick={handleHistoryReachBottom}>
            再加载一点
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
