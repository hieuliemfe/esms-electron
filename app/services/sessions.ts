/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';

type WeekInfo = {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
};

export type SessionSummaryInfo = {
  angryWarningCount: number;
  totalSessions: number;
  angryInDayOfWeeks: WeekInfo;
};

export type SessionInfo = {
  id: number;
  employeeId: string;
  sessionStart: string;
  sessionEnd: string;
  sessionDuration: number;
  angryWarningCount: number;
};

export type GetSessionSummaryData = {
  employeeCode: string;
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
};

export type GetSessionSummaryResult = {
  summary: SessionSummaryInfo;
  sessions: SessionInfo[];
};

type GetSessionSummaryResponse = EsmsResponse<GetSessionSummaryResult>;

const objToParamStr = (obj: any) =>
  Object.entries(obj)
    .map((e) => e.join('='))
    .join('&');

export async function getSessionSummary(
  getSessionSummaryData: GetSessionSummaryData
): Promise<GetSessionSummaryResponse> {
  const data = { ...{ page: 1, limit: 100 }, ...getSessionSummaryData };
  return request.get(`/sessions?${objToParamStr(data)}`) as Promise<
    GetSessionSummaryResponse
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

export type EmotionPeriodData = {
  duration: number;
  periodEnd: number;
  periodStart: number;
};

export type EmotionData = {
  emotion: number;
  periods: EmotionPeriodData[];
};

export type EndSessionData = {
  emotions: EmotionData[];
  info: string;
};

type EndSessionResponse = EsmsResponse<any>;

export async function endSession(
  sessionId: number,
  detectedData: EndSessionData
): Promise<EndSessionResponse> {
  return request.put(`/sessions/${sessionId}/end`, {
    body: JSON.stringify(detectedData),
  }) as Promise<EndSessionResponse>;
}

type AvailableSessionDateData = {
  employeeCode: string;
  startDate: string;
  endDate: string;
};

type AvailableSessionDateInfo = {
  [date: string]: number;
};

type AvailableSessionDateResponse = EsmsResponse<AvailableSessionDateInfo>;

export async function availableSessionDate(
  availableSessionDateData: AvailableSessionDateData
): Promise<AvailableSessionDateResponse> {
  return request.put(
    `/sessions/available?${objToParamStr(availableSessionDateData)}`
  ) as Promise<AvailableSessionDateResponse>;
}
