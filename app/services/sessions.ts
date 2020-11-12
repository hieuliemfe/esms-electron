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

export type SessionSummaryResult = {
  sumary: SessionSummaryInfo;
  sessions: SessionInfo[];
};

type GetSessionSummaryResponse = EsmsResponse<SessionSummaryResult>;

export async function getSessionSummary(
  employeeCode: string,
  page = 1,
  limit = 10
): Promise<GetSessionSummaryResponse> {
  return request.get(
    `/sessions?employeeCode=${employeeCode}&page=${page}&limit=${limit}`
  ) as Promise<GetSessionSummaryResponse>;
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
