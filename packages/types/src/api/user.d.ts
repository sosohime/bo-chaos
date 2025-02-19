// 用户相关接口的请求响应类型
export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role: string;
  createTime: string;
}

export interface UserLoginResponse {
  token: string;
  userInfo: UserInfo;
}
