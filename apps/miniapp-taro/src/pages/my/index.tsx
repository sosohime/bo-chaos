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
import { uploadPhoto } from "../../api/photo";
import { getBoDailyCard, type BoDailyCard } from "../../api/bo";
import { useUploadHistory } from "@/features/upload/use-upload-history";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";
import type {
  CategorySystem,
  PhotoCategoryDto,
  PhotoDto,
  UploadedPhotoStatusFilter,
  UserProfileDto,
} from "@mono/types";
import Criminal from "../../images/criminal.png";
import Edit from "../../images/edit.png";
import { normalizeMediaUrl, normalizeMediaUrls } from "@/lib/media-url";

import "./index.scss";

type CategoryType = PhotoCategoryDto;
type SystemOption = {
  label: string;
  value: CategorySystem;
};

const MAX_SELECTED_IMAGES = 30;
const UPLOAD_CONCURRENCY = 3;

type UploadSummary = {
  successCount: number;
  failedCount: number;
} | null;

const emptyUserInfo: UserProfileDto = {
  id: 0,
  openId: "",
  avatarUrl: "",
  nickname: "",
  kowtowCount: 0,
  joinTime: "",
  photoReviewer: false,
};

export default function My() {
  const { systemConfig } = useContext(AppContext);
  const miniapp = getMiniappConfig(systemConfig);
  const ugcEnabled = isUgcEnabled(systemConfig);

  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserProfileDto>(emptyUserInfo);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<{
    label: string;
    value: CategorySystem;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>(null);
  const [activeHistoryTab, setActiveHistoryTab] =
    useState<UploadedPhotoStatusFilter>("pending");
  const pendingPhotos = useUploadHistory("pending", ugcEnabled);
  const approvedPhotos = useUploadHistory("approved", ugcEnabled);
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
    categories.reduce<Partial<Record<CategorySystem, SystemOption>>>((p, c) => {
      if (!p[c.system]) {
        p[c.system] = {
          label: c.systemName,
          value: c.system,
        };
      }
      return p;
    }, {}),
  ) as SystemOption[];

  const categoryMap = groupBy(
    categories.filter((item) => item.system === selectedSystem?.value),
    (item) => item.name,
  );

  useEffect(() => {
    fetchUserInfo();
    fetchCategories();
    fetchBoDailyCard();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      Taro.showNavigationBarLoading();
      const refreshTasks = [
        fetchUserInfo(),
        fetchCategories(),
        fetchBoDailyCard(),
      ];
      if (ugcEnabled) {
        refreshTasks.push(pendingPhotos.refresh(), approvedPhotos.refresh());
      }
      await Promise.all(refreshTasks);
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
      setUserInfo(info || emptyUserInfo);
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

  const handleHistoryReachBottom = () => {
    if (!ugcEnabled) return;
    const history =
      activeHistoryTab === "pending" ? pendingPhotos : approvedPhotos;
    history.loadMore();
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

  const previewUploadedPhoto = (photo: PhotoDto, photos: PhotoDto[]) => {
    Taro.previewImage({
      current: normalizeMediaUrl(photo.filename),
      urls: normalizeMediaUrls(photos.map((item) => item.filename)),
    });
  };

  const handleAvatarClick = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });
      const uploadRes = await uploadAvatar({
        filePath: res.tempFilePaths[0],
      });
      setUserInfo(uploadRes);
    } catch (error) {
      console.error("选择头像失败:", error);
    }
  };

  const navToApprove = (approval: UploadedPhotoStatusFilter): void => {
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
    if (!ugcEnabled) return;
    try {
      const remaining = MAX_SELECTED_IMAGES - selectedImages.length;
      if (remaining <= 0) {
        Taro.showToast({
          title: `最多选择 ${MAX_SELECTED_IMAGES} 张`,
          icon: "none",
        });
        return;
      }
      const res = await Taro.chooseMedia({
        count: Math.min(9, remaining),
        mediaType: ["image"],
        sourceType: ["album", "camera"],
        sizeType: ["compressed"],
      });
      setUploadSummary(null);
      setSelectedImages((prev) => [
        ...prev,
        ...res.tempFiles.map((f) => f.tempFilePath),
      ]);
    } catch (error) {
      console.error("选择图片失败:", error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadSummary(null);
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

  const runUploadQueue = async <T,>(
    items: T[],
    worker: (item: T, index: number) => Promise<void>,
  ) => {
    const results = new Array(items.length) as PromiseSettledResult<number>[];
    let cursor = 0;
    const runners = Array.from(
      { length: Math.min(UPLOAD_CONCURRENCY, items.length) },
      async () => {
        while (cursor < items.length) {
          const index = cursor;
          cursor += 1;
          try {
            await worker(items[index], index);
            results[index] = { status: "fulfilled", value: index };
          } catch (reason) {
            results[index] = { status: "rejected", reason };
          }
        }
      },
    );
    await Promise.all(runners);
    return results;
  };

  const handleSubmit = async () => {
    if (!ugcEnabled) return;
    const nextCategoryName = newCategoryName.trim();
    if (
      !selectedSystem ||
      (!selectedCategoryId && !nextCategoryName) ||
      !selectedImages.length
    ) {
      Taro.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }

    setIsSubmitting(true);
    setUploadSummary(null);
    try {
      const tasks = selectedImages.map((img) => ({
        name: selectedSystem.label,
        system: selectedSystem.value,
        categoryId: +selectedCategoryId,
        newCategory: nextCategoryName,
        filePath: img,
      }));

      const results = await runUploadQueue(tasks, async (data, index) => {
        setUploadStatus((prev) => ({
          ...prev,
          [index]: {
            process: 0,
            status: "uploading",
          },
        }));

        try {
          await uploadPhoto(data, (process) => {
            setUploadStatus((prev) => ({
              ...prev,
              [index]: { ...prev[index], process },
            }));
          });
          setUploadStatus((prev) => ({
            ...prev,
            [index]: { ...prev[index], process: 100, status: "finish" },
          }));
        } catch (error) {
          setUploadStatus((prev) => ({
            ...prev,
            [index]: { ...prev[index], status: "error" },
          }));
          throw error;
        }
      });

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failedCount = results.filter((r) => r.status === "rejected").length;
      setUploadSummary({ successCount, failedCount });

      if (failedCount === 0) {
        Taro.showToast({
          title: "上传成功",
          icon: "success",
          duration: 2000,
        });
        setSelectedImages([]);
        setSelectedSystem(null);
        setSelectedCategory("");
        setSelectedCategoryId(0);
        setNewCategoryName("");
        setIsNewCategory(false);
        setUploadStatus({});
      } else if (successCount > 0) {
        Taro.showModal({
          title: "提示",
          content: `${successCount}张图片上传成功，${failedCount}张上传失败，您可以重新上传失败的图片`,
          showCancel: false,
        });
        const successIndexes = results
          .map((r, i) => (r.status === "fulfilled" ? i : -1))
          .filter((i) => i !== -1);
        setSelectedImages((prev) =>
          prev.filter((_, index) => !successIndexes.includes(index)),
        );
        setUploadStatus({});
      } else {
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
      const refreshTasks = [fetchBoDailyCard()];
      if (ugcEnabled) {
        refreshTasks.push(
          pendingPhotos.refresh().catch(() => null),
          approvedPhotos.refresh().catch(() => null),
        );
      }
      await Promise.all(refreshTasks);
      setIsSubmitting(false);
    }
  };

  const activeHistory =
    activeHistoryTab === "pending" ? pendingPhotos : approvedPhotos;
  const activeHistoryTitle =
    activeHistoryTab === "pending" ? "审核中" : "已通过";
  const activeHistoryEmpty =
    activeHistoryTab === "pending" ? "还没有待审核图片" : "还没有通过的图片";
  const selectedCategoryLabel = isNewCategory
    ? newCategoryName.trim() || "新分类"
    : selectedCategory || "未选择";
  const uploadStage = isSubmitting
    ? "上传中"
    : uploadSummary?.successCount
      ? "已提交"
      : selectedImages.length
        ? "待提交"
        : selectedCategoryId || isNewCategory
          ? "待选图片"
          : selectedSystem
            ? "待定分类"
            : "待选板块";
  const uploadReviewState = uploadSummary
    ? uploadSummary.failedCount
      ? "部分失败"
      : "等待审核"
    : "未提交";

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
      <View className="my-content">
        <View className="user-info">
          <Image
            className="avatar"
            mode="aspectFit"
            src={normalizeMediaUrl(userInfo.avatarUrl) || Criminal}
            lazyLoad
            onClick={handleAvatarClick}
          />
          <View className="user-name">
            <Text className="account-kicker">ACCOUNT NODE</Text>
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
                className="nickname-view"
                onClick={() => {
                  setIsEditingName(true);
                  setEditingName(userInfo.nickname);
                }}
              >
                <Text className="nickname">
                  {userInfo.nickname || "设置昵称"}
                </Text>
                <Image
                  className="nickname-edit-icon"
                  mode="aspectFit"
                  src={Edit}
                />
              </View>
            )}
          </View>
          <Text className="account-status">资料</Text>
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
              <Text>交互 {boDailyCard.stats.kowtowCount}</Text>
              <Text>上传 {boDailyCard.stats.uploadCount}</Text>
              <Text>审核通过 {boDailyCard.stats.approvedCount}</Text>
            </View>
          </View>
        )}

        {!systemConfig?.inReview && (
          <View className="record-section">
            <Text className="record-kicker">INTERACTION LOG</Text>
            <View className="section-title">活动记录</View>
            <Text>
              账户已运行{" "}
              {userInfo.joinTime
                ? Math.max(
                    1,
                    Math.ceil(
                      dayjs().diff(dayjs(userInfo.joinTime), "day", true),
                    ),
                  )
                : 0}{" "}
              天，累计交互 {userInfo.kowtowCount} 次
            </Text>
          </View>
        )}

        {ugcEnabled ? (
          <View className="upload-section">
            <View className="upload-console-head">
              <View>
                <Text className="section-title">
                  {systemConfig?.inReview
                    ? miniapp.pages.reviewUploadTitle
                    : miniapp.pages.uploadTitle}
                </Text>
                <Text className="upload-console-subtitle">
                  已选 {selectedImages.length}/{MAX_SELECTED_IMAGES}
                </Text>
              </View>
              <Text className="upload-console-status">
                {isSubmitting ? "上传中" : "待提交"}
              </Text>
            </View>

            <View className="upload-task-summary">
              <View className="upload-summary-item primary">
                <Text className="upload-summary-label">当前阶段</Text>
                <Text className="upload-summary-value">{uploadStage}</Text>
              </View>
              <View className="upload-summary-item">
                <Text className="upload-summary-label">板块</Text>
                <Text className="upload-summary-value">
                  {selectedSystem?.label || "未选择"}
                </Text>
              </View>
              <View className="upload-summary-item">
                <Text className="upload-summary-label">队列</Text>
                <Text className="upload-summary-value">
                  {selectedImages.length
                    ? `${selectedImages.length}/${MAX_SELECTED_IMAGES}`
                    : "空"}
                </Text>
              </View>
            </View>

            <View className="upload-steps">
              <View
                className={`upload-step ${selectedSystem ? "done" : "active"}`}
              >
                <Text className="upload-step-index">01</Text>
                <Text>板块</Text>
              </View>
              <View
                className={`upload-step ${
                  selectedCategoryId || isNewCategory
                    ? "done"
                    : selectedSystem
                      ? "active"
                      : ""
                }`}
              >
                <Text className="upload-step-index">02</Text>
                <Text>分类</Text>
              </View>
              <View
                className={`upload-step ${
                  selectedImages.length
                    ? "done"
                    : selectedCategoryId || isNewCategory
                      ? "active"
                      : ""
                }`}
              >
                <Text className="upload-step-index">03</Text>
                <Text>图片</Text>
              </View>
              <View
                className={`upload-step ${
                  uploadSummary?.successCount
                    ? "done"
                    : selectedImages.length
                      ? "active"
                      : ""
                }`}
              >
                <Text className="upload-step-index">04</Text>
                <Text>审核</Text>
              </View>
            </View>

            {uploadSummary && (
              <View
                className={`upload-result ${
                  uploadSummary.failedCount ? "partial" : "success"
                }`}
              >
                <Text className="upload-result-title">
                  {uploadSummary.failedCount
                    ? "队列部分提交失败"
                    : "队列已提交审核"}
                </Text>
                <Text>
                  成功 {uploadSummary.successCount} 张
                  {uploadSummary.failedCount
                    ? `，失败 ${uploadSummary.failedCount} 张`
                    : "，可以在审核中查看进度"}
                </Text>
                <View className="upload-result-actions">
                  <Button
                    className="upload-result-button"
                    size="mini"
                    onClick={() => {
                      setActiveHistoryTab("pending");
                      navToApprove("pending");
                    }}
                  >
                    查看审核中
                  </Button>
                  {uploadSummary.failedCount > 0 && (
                    <Button
                      className="upload-result-button"
                      size="mini"
                      onClick={handleSubmit}
                    >
                      重试失败项
                    </Button>
                  )}
                </View>
              </View>
            )}

            <View className="upload-form-panel">
              <View className="upload-form-head">
                <View>
                  <Text className="upload-form-kicker">TASK CONFIG</Text>
                  <Text className="upload-form-title">上传任务配置</Text>
                </View>
                <Text className="upload-form-state">
                  {selectedCategoryLabel}
                </Text>
              </View>
              <View className="upload-field">
                <Text className="upload-field-label">板块</Text>
                <Picker
                  mode="selector"
                  range={systems}
                  rangeKey="label"
                  onChange={handleSystemChange}
                >
                  <View className="picker">
                    {selectedSystem?.label || "选择板块"}
                  </View>
                </Picker>
              </View>

              {selectedSystem && (
                <>
                  <View className="category-section">
                    <View className="upload-field">
                      <Text className="upload-field-label">分类</Text>
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
                    </View>
                    <View
                      className={`checkbox ${isSubmitting ? "disabled" : ""}`}
                      onClick={() =>
                        !isSubmitting &&
                        setIsNewCategory((current) => {
                          const next = !current;
                          setSelectedCategory("");
                          setSelectedCategoryId(0);
                          setNewCategoryName("");
                          return next;
                        })
                      }
                    >
                      <Text>{isNewCategory ? "✓" : ""}</Text>
                      <Text>创建新分类</Text>
                    </View>

                    <View className="upload-decision-line">
                      <Text>分类：{selectedCategoryLabel}</Text>
                      <Text>审核：{uploadReviewState}</Text>
                    </View>

                    <Button
                      className="add-image"
                      disabled={isSubmitting}
                      onClick={handleAddImages}
                    >
                      {selectedImages.length
                        ? `继续添加（已选 ${selectedImages.length}/${MAX_SELECTED_IMAGES} 张）`
                        : "添加图片"}
                    </Button>

                    <Button
                      className={`submit-btn ${isSubmitting ? "loading" : ""}`}
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "上传中..." : "提交"}
                    </Button>
                  </View>
                </>
              )}
            </View>

            {selectedSystem && (
              <>
                {selectedImages.length > 0 && (
                  <View className="image-list">
                    <View className="image-list-head">
                      <View>
                        <Text className="image-list-kicker">UPLOAD QUEUE</Text>
                        <Text className="image-list-title">图片队列</Text>
                      </View>
                      <Text className="image-list-state">
                        {selectedImages.length}/{MAX_SELECTED_IMAGES}
                      </Text>
                    </View>
                    {selectedImages.map((img, index) => (
                      <View key={index} className="image-item">
                        <Image
                          src={img}
                          mode="aspectFit"
                          lazyLoad
                          className="preview-image"
                          onClick={() =>
                            Taro.previewImage({
                              current: img,
                              urls: selectedImages,
                            })
                          }
                        />
                        {uploadStatus[index]?.status === "uploading" && (
                          <View className="upload-process">
                            <View className="circle-progress">
                              <View
                                className="progress-value"
                                style={{
                                  background: `conic-gradient(#0052d9 ${uploadStatus[index].process * 3.6}deg, rgba(255, 255, 255, 0.35) 0deg)`,
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
                        {uploadStatus[index]?.status === "error" && (
                          <View className="upload-error">失败</View>
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
        ) : (
          <View className="ugc-disabled-section">
            <View className="section-title">{miniapp.ugc.disabledTitle}</View>
            <Text>{miniapp.ugc.disabledMessage}</Text>
          </View>
        )}

        {ugcEnabled && (
          <View className="history-section">
            <View className="history-header">
              <View>
                <View className="section-title">上传记录</View>
                <Text className="history-subtitle">
                  当前 {activeHistoryTitle}{" "}
                  {activeHistory.total ? `${activeHistory.total} 项` : "暂无"}
                </Text>
              </View>
              <Text
                className="history-link"
                onClick={() => navToApprove(activeHistoryTab)}
              >
                查看全部
              </Text>
            </View>
            <View className="history-tabs">
              <View
                className={`history-tab ${
                  activeHistoryTab === "pending" ? "active" : ""
                }`}
                onClick={() => setActiveHistoryTab("pending")}
              >
                <Text>审核中</Text>
                <Text className="history-tab-count">
                  {pendingPhotos.total || 0}
                </Text>
              </View>
              <View
                className={`history-tab ${
                  activeHistoryTab === "approved" ? "active" : ""
                }`}
                onClick={() => setActiveHistoryTab("approved")}
              >
                <Text>已通过</Text>
                <Text className="history-tab-count">
                  {approvedPhotos.total || 0}
                </Text>
              </View>
            </View>
            <View className="history-note">
              {activeHistoryTab === "pending"
                ? "提交后的图片会进入审核队列，通过后自动同步到对应板块。"
                : "已通过图片会作为可见资源展示在对应分类页。"}
            </View>
            <View className="photo-grid">
              {activeHistory.items.length > 0
                ? activeHistory.items.map((photo) => (
                    <Image
                      key={photo.id}
                      src={normalizeMediaUrl(photo.filename)}
                      mode="aspectFill"
                      lazyLoad
                      className="history-image"
                      onClick={() =>
                        previewUploadedPhoto(photo, activeHistory.items)
                      }
                    />
                  ))
                : !activeHistory.loading && (
                    <View className="history-empty">
                      <Text className="history-empty-kicker">QUEUE STATE</Text>
                      <Text className="history-empty-title">
                        {activeHistoryEmpty}
                      </Text>
                    </View>
                  )}
              {activeHistory.loading && (
                <View className="history-empty">
                  <Text className="history-empty-kicker">QUEUE SYNC</Text>
                  <Text className="history-empty-title">加载中</Text>
                </View>
              )}
            </View>
            {activeHistory.hasMore && (
              <Button className="load-more" onClick={handleHistoryReachBottom}>
                加载更多{activeHistoryTitle}
              </Button>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
