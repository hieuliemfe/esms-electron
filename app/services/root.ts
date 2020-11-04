import request from '../utils/request';

type LoginInfo = {
  employeeCode: string;
  roleName: string;
};

type LoginResponse = {
  status: boolean;
  token: string;
  message: LoginInfo;
};

export async function login(
  employeeCode: string,
  password: string
): Promise<LoginResponse> {
  const payload = { employeeCode, password };
  return request.post('/login', {
    body: JSON.stringify(payload),
  }) as Promise<LoginResponse>;
}

type RoleInfo = {
  id: number;
  roleName: string;
};

export type ProfileInfo = {
  id: string;
  employeeCode: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  avatarUrl: string;
  isSubscribed: boolean;
  Role: RoleInfo;
};

type ProfileResponse = {
  status: boolean;
  message: ProfileInfo;
};

export async function getProfile(): Promise<ProfileResponse> {
  return request.get('/profile') as Promise<ProfileResponse>;
}
