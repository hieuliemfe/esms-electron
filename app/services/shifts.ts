import request from '../utils/request';

type ShiftInfo = {
  id: number;
  employeeId: string;
  counterId: number;
  shiftStart: string;
  shiftEnd: string;
  statusId: number;
  shiftTypeId: number;
};

type ShiftResponse = {
  status: boolean;
  message: ShiftInfo[];
};

export async function getShifts(): Promise<ShiftResponse> {
  return request.get('/shifts') as Promise<ShiftResponse>;
}

export async function getActiveShifts(): Promise<ShiftResponse> {
  return request.get('/shifts/active-shift') as Promise<ShiftResponse>;
}

type ShiftSummary = {
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

type ShiftSummaryResponse = {
  status: boolean;
  message: ShiftSummary;
};

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
