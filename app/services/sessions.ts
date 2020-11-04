import request, { EsmsResponse } from '../utils/request';

type CreateSessionInfo = {
  id: number;
};

type CreateSessionResponse = EsmsResponse<CreateSessionInfo>;

export async function createSession(): Promise<CreateSessionResponse> {
  return request.post('/sessions') as Promise<CreateSessionResponse>;
}

type StartSessionResponse = EsmsResponse<number[]>;

export async function startSession(
  sessionId: number
): Promise<StartSessionResponse> {
  return request.put(`/sessions/${sessionId}/start`) as Promise<
    StartSessionResponse
  >;
}

type EndSessionResponse = EsmsResponse<any>;

export async function endSession(
  sessionId: number
): Promise<EndSessionResponse> {
  return request.put(`/sessions/${sessionId}/end`) as Promise<
    EndSessionResponse
  >;
}
