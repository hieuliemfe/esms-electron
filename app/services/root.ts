import request from '../utils/request';

export async function login(employeeCode: string, password: string) {
  const payload = { employeeCode, password };
  return request.post('/login', {
    body: JSON.stringify(payload),
  });
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
