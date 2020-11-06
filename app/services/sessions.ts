/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';

export type SessionInfo = {
  id: number;
  employeeId: string;
  sessionStart: string;
  sessionEnd: string;
  info: string;
  status: string;
};

type GetSessionResponse = EsmsResponse<SessionInfo[]>;

export async function getSessionSummary(
  page = 1,
  limit = 10
): Promise<GetSessionResponse> {
  return request.get(`/sessions?page=${page}&limit=${limit}`) as Promise<
    GetSessionResponse
  >;
}

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

export type EmotionPeriodInfo = {
  duration: number;
  periodEnd: number;
  periodStart: number;
};

export type EmotionInfo = {
  emotion: number;
  periods: EmotionPeriodInfo[];
};

export type EndSessionInfo = {
  emotions: EmotionInfo[];
  info: string;
};

type EndSessionResponse = EsmsResponse<any>;

export async function endSession(
  sessionId: number,
  detectedData: EndSessionInfo
): Promise<EndSessionResponse> {
  return request.put(`/sessions/${sessionId}/end`, {
    body: JSON.stringify(detectedData),
  }) as Promise<EndSessionResponse>;
}
