import { ActionButton } from "./async-feedback";
import BottomSheet, { SheetInput } from "./bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Text, View } from "@tarojs/components";
import Taro, { useDidHide } from "@tarojs/taro";
import type { GroupRankProfile } from "@mono/types";
import { currentGroupGeneration, groupApi } from "../lib/api";
import Avatar from "./avatar";
import { beginNativeAvatarSelection } from "../lib/native-media";

export default function ProfileSheet({
  profile,
  continuing,
  onClose,
  onSaved,
  onUpdated,
  submitLabel,
}: {
  profile: GroupRankProfile;
  continuing: boolean;
  onClose: () => void;
  onSaved: (profile: GroupRankProfile) => void;
  onUpdated: (profile: GroupRankProfile) => void;
  submitLabel?: string;
}) {
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const supportsReview = useRef(
    typeof Taro.canIUse === "function" &&
      Taro.canIUse("input.bindnicknamereview"),
  );
  const intent = useRef(0);
  const waiter = useRef<{ finish: (reason?: Error) => void } | null>(null);
  const review = useRef<"unchanged" | "pending" | "passed" | "failed">(
    "unchanged",
  );
  const lock = useRef(false);
  const active = useRef(true);
  const avatarSelection = useRef<(() => void) | null>(null);
  function cancelPending() {
    intent.current += 1;
    waiter.current?.finish(new Error("已取消保存"));
    lock.current = false;
    if (active.current) {
      setBusy(false);
      setChecking(false);
    }
  }
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      avatarSelection.current?.();
      cancelPending();
    };
  }, []);
  useDidHide(cancelPending);

  function waitForReview() {
    return new Promise<void>((resolve, reject) => {
      const pending = {
        finish: (reason?: Error) => {
          clearTimeout(timer);
          if (waiter.current === pending) waiter.current = null;
          if (reason) reject(reason);
          else resolve();
        },
      };
      const timer = setTimeout(() => {
        review.current = "failed";
        pending.finish(new Error("昵称检查超时，请重新输入后再试。"));
      }, 5000);
      waiter.current = pending;
    });
  }
  async function save(value: unknown) {
    if (lock.current) return;
    // Native form submission contains the current nickname; keep this exact intent through review.
    const submitted = typeof value === "string" ? value.trim() : "";
    if (continuing && !submitted) {
      setError("请选择或填写昵称。");
      return;
    }
    if (continuing && !avatar && !profile.avatarVersion) {
      setError("请选择头像。");
      return;
    }
    if (review.current === "failed") {
      setError("这个昵称没有通过检查，请换一个。");
      return;
    }
    const operation = ++intent.current;
    const generation = currentGroupGeneration();
    const isCurrent = () =>
      active.current &&
      intent.current === operation &&
      currentGroupGeneration() === generation;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (review.current === "pending" && supportsReview.current) {
        setChecking(true);
        await waitForReview();
      }
      if (!isCurrent()) return;
      setChecking(false);
      // Older clients lack nicknamereview. The server still requires text moderation before saving.
      const saved = await groupApi.saveProfile(submitted, avatar || undefined);
      if (isCurrent()) {
        if (continuing && (!saved.nickname?.trim() || !saved.avatarVersion)) {
          onUpdated(saved);
          setError(
            !saved.nickname?.trim()
              ? "昵称还没有保存成功，请重新选择或填写后保存。"
              : "头像还没有保存成功，请重新选择后保存。",
          );
          return;
        }
        onSaved(saved);
      }
    } catch (reason) {
      if (isCurrent())
        setError(reason instanceof Error ? reason.message : "保存失败，请重试");
    } finally {
      if (active.current && intent.current === operation) {
        lock.current = false;
        setBusy(false);
        setChecking(false);
      }
    }
  }
  async function removeAvatar() {
    if (avatar) {
      setAvatar("");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await groupApi.removeAvatar();
      if (active.current) onUpdated(saved);
    } catch (reason) {
      if (active.current)
        setError(reason instanceof Error ? reason.message : "移除失败，请重试");
    } finally {
      lock.current = false;
      if (active.current) setBusy(false);
    }
  }
  return (
    <BottomSheet onSubmit={(event) => void save(event.detail.value?.nickname)} header={
        <View className="profile-heading">
          <Text className="section-title">
            {continuing ? "先设置头像和昵称" : "修改资料"}
          </Text>
          <Button
            className="text-action"
            disabled={busy && !checking}
            onClick={() => {
              cancelPending();
              onClose();
            }}
          >
            关闭
          </Button>
        </View>
      } footer={<>
          {error && <Text className="profile-error">{error}</Text>}
          <ActionButton
            className="action"
            formType="submit"
            loading={busy}
            pendingLabel={checking ? "正在检查昵称…" : "正在保存资料…"}
            disabled={busy}
          >
            {checking
              ? "正在检查昵称…"
              : continuing
                ? submitLabel || "保存并提交成绩"
                : "保存资料"}
          </ActionButton>

      </>}>

        <Text className="description">
          头像和昵称会显示在你参与的榜单中。
        </Text>
        <View className="profile-avatar-row">
          <Button
            className="avatar-picker"
            openType="chooseAvatar"
            disabled={busy}
            onClick={() => {
              avatarSelection.current?.();
              avatarSelection.current = beginNativeAvatarSelection();
            }}
            onError={() => avatarSelection.current?.()}
            onChooseAvatar={(event) => {
              avatarSelection.current?.();
              if (lock.current) return;
              setAvatar(event.detail.avatarUrl);
              setError("");
            }}
          >
            {avatar ? (
              <Image
                className="person-avatar-image"
                src={avatar}
                mode="aspectFill"
              />
            ) : (
              <Avatar
                userId={profile.userId}
                version={profile.avatarVersion}
                name={profile.nickname || "群友"}
              />
            )}
            <Text>选择头像</Text>
          </Button>
          {(avatar || profile.avatarVersion) && (
            <Button
              className="text-action"
              disabled={busy}
              onClick={removeAvatar}
            >
              {avatar ? "取消新头像" : "移除头像"}
            </Button>
          )}
        </View>

          <Text className="entry-label">昵称</Text>
          <SheetInput
            className="entry-control"
            type="nickname"
            name="nickname"
            value={nickname}
            maxlength={24}
            placeholder="你在群里用的名字"
            disabled={busy}
            onInput={(event) => {
              if (lock.current) return;
              setNickname(event.detail.value);
              review.current = event.detail.value.trim()
                ? "pending"
                : "unchanged";
              setError("");
            }}
            onNickNameReview={(event) => {
              const result = event.detail as {
                pass?: boolean;
                timeout?: boolean;
              };
              if (!active.current) return;
              supportsReview.current = true;
              review.current = result.pass ? "passed" : "failed";
              const message = result.timeout
                ? "昵称检查超时，请重新输入后再试。"
                : "这个昵称没有通过检查，请换一个。";
              if (waiter.current)
                waiter.current.finish(
                  result.pass ? undefined : new Error(message),
                );
              else if (!result.pass) setError(message);
            }}
          />

    </BottomSheet>
  );
}
