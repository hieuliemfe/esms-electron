/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { EsmsResponse } from '../utils/request';
// eslint-disable-next-line import/no-cycle
import { ShiftInfo } from './shifts';

export type ShiftTypeInfo = {
  id: number;
  name: string;
  shiftStart: string;
  shiftEnd: string;
  isActive?: boolean;
  isAvailable?: boolean;
  isToCheckIn?: boolean;
  ShiftToCheckIn?: ShiftInfo;
};

type ShiftTypeResponse = EsmsResponse<ShiftTypeInfo[]>;

export async function getShiftTypes(): Promise<ShiftTypeResponse> {
  return request.get('/shifttypes') as Promise<ShiftTypeResponse>;
}
