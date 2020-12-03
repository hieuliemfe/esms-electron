/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';

export type ShiftInfo = {
  id: number;
  name: string;
  shiftStart: string;
  shiftEnd: string;
  isActive?: boolean;
  isOver?: boolean;
  isToCheckIn?: boolean;
};

type ShiftResponse = EsmsResponse<ShiftInfo[]>;

export async function getShifts(): Promise<ShiftResponse> {
  return request.get('/shifts') as Promise<ShiftResponse>;
}
