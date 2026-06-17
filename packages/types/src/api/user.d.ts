export interface AdminLoginRequest {
  account: string;
  password: string;
}

export interface WechatLoginRequest {
  code: string;
}

export interface WechatLoginResponse {
  accessToken: string;
}

export interface UserProfileDto {
  id: number;
  openId: string;
  nickname: string;
  avatarUrl: string | null;
  joinTime: string;
  photoReviewer: boolean;
  kowtowCount: number;
}

export interface UpdateUserProfileRequest {
  nickname: string;
}
