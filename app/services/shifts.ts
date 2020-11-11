/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';
import { ShiftTypeInfo } from './shift-types';

export type ShiftInfo = {
  id: number;
  employeeId: string;
  counterId: number;
  shiftDate: string;
  statusId: number;
  ShiftType: ShiftTypeInfo;
  isToCheckin?: boolean;
};

type ShiftResponse = EsmsResponse<ShiftInfo[]>;

export async function getShifts(): Promise<ShiftResponse> {
  return request.get('/shifts') as Promise<ShiftResponse>;
}

export async function getActiveShift(): Promise<ShiftResponse> {
  return request.get('/shifts/active-shift') as Promise<ShiftResponse>;
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
