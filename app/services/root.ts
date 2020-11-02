import request from '../utils/request';

type UserInfo = {
  employeeCode: string;
  roleName: string;
};

type LoginResponse = {
  message: UserInfo;
  status: boolean;
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

export async function register(
  fullname: string,
  phoneNumber: string,
  avatarUrl: string
) {
  const payload = { fullname, phoneNumber, avatarUrl, roleId: 3 };
  return request.post('/register', {
    body: JSON.stringify(payload),
  });
}
