/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';

export type ShiftTypeInfo = {
  id: number;
  name: string;
  shiftStart: string;
  shiftEnd: string;
  isOverTime?: boolean;
};

type ShiftTypeResponse = EsmsResponse<ShiftTypeInfo[]>;

export async function getShiftTypes(): Promise<ShiftTypeResponse> {
  return request.get('/shifttypes') as Promise<ShiftTypeResponse>;
}
