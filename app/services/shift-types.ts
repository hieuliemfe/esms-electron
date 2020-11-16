/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';

export type ShiftTypeInfo = {
  id: number;
  name: string;
  shiftStart: string;
  shiftEnd: string;
  isActive?: boolean;
  isOver?: boolean;
  isToCheckIn?: boolean;
};

type ShiftTypeResponse = EsmsResponse<ShiftTypeInfo[]>;

export async function getShiftTypes(): Promise<ShiftTypeResponse> {
  return request.get('/shifttypes') as Promise<ShiftTypeResponse>;
}
