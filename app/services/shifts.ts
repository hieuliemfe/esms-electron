/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';
// eslint-disable-next-line import/no-cycle
import { ShiftTypeInfo } from './shift-types';

export type ShiftInfo = {
  id: number;
  employeeId: string;
  counterId: number;
  shiftDate: string;
  statusId: number;
  ShiftType: ShiftTypeInfo;
};

type GetShiftInfo = {
  activeShifts: ShiftInfo[];
};

type GetShiftResponse = EsmsResponse<GetShiftInfo>;

export async function getShifts(): Promise<GetShiftResponse> {
  return request.get('/shifts') as Promise<GetShiftResponse>;
}

export type CreateShiftData = {
  shiftTypeId: number;
};

export type CreateShiftInfo = {
  shiftId: number;
};

type CreateShiftResponse = EsmsResponse<CreateShiftInfo>;

export async function createShift(
  shiftData: CreateShiftData
): Promise<CreateShiftResponse> {
  return request.post('/shifts', {
    body: JSON.stringify(shiftData),
  }) as Promise<CreateShiftResponse>;
}

export type ShiftSummary = {
  totalSessions: number;
  neutralSessions: number;
  positiveSessions: number;
  negativeSessions: number;
  emotionlessSessions: number;
  angryWarnings: number;
  noFaceWarnings: number;
  stressLevel: number;
  stressWarning: boolean;
  stressSolution: any | null;
};

type ShiftSummaryResponse = EsmsResponse<ShiftSummary>;

export async function getShiftSummary(
  shiftId: number
): Promise<ShiftSummaryResponse> {
  return request.get(`/shifts/${shiftId}/summary`) as Promise<
    ShiftSummaryResponse
  >;
}

export async function checkinShift(shiftId: number) {
  return request.put(`/shifts/${shiftId}/checkin`);
}

export async function checkoutShift(shiftId: number) {
  return request.put(`/shifts/${shiftId}/checkout`);
}
