import request, { uploadFile } from "../lib/request";
import type { UserProfileDto } from "@mono/types";

export function getUserInfo() {
  return request.get<UserProfileDto | null>("/users/me");
}

export function updateNickname(nickname: string) {
  return request.patch<UserProfileDto | null>("/users/me", {
    nickname,
  });
}

export function uploadAvatar({ filePath }: { filePath: string }) {
  return uploadFile<UserProfileDto>({
    url: "/users/me/avatar",
    filePath,
  });
}
