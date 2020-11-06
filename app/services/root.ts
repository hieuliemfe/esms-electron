import request from '../utils/request';
import { ProfileInfo } from '../features/login/loginSlice';

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

type ProfileResponse = {
  status: boolean;
  message: ProfileInfo;
};

export async function getProfile(): Promise<ProfileResponse> {
  return request.get('/profile') as Promise<ProfileResponse>;
}
