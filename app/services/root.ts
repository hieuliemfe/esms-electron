import request, { EsmsResponse } from '../utils/request';
// eslint-disable-next-line import/no-cycle
import { Suspension } from '../features/login/loginSlice';
import { CounterInfo } from './counters';

type LoginInfo = {
  employeeCode: string;
  roleName: string;
  Counter: CounterInfo;
  suspensions?: Suspension[];
};

type LoginResponse = EsmsResponse<LoginInfo> & {
  token: string;
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

export type RoleInfo = {
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
  counterId: number;
  Role: RoleInfo;
};

type ProfileResponse = EsmsResponse<ProfileInfo>;

export async function getProfile(): Promise<ProfileResponse> {
  return request.get('/profile') as Promise<ProfileResponse>;
}
